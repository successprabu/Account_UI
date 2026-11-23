/** AI in Mahal Management: customer chat on hall pages, "type or speak a booking", and follow-ups. */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMock = vi.fn();
vi.mock('axios', () => {
  const fn = (...args) => axiosMock(...args);
  const instance = Object.assign(fn, {
    get: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    post: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  });
  instance.create = () => instance;
  return { default: instance };
});

import AiChat from '../components/mahal/AiChat';
import { AiQuickBooking, FollowUpsPanel, draftToForm } from '../components/mahal/AiBooking';
import { resetAiStatus } from '../api/mahalAi';

const ok = (data, message = 'OK') => Promise.resolve({ data: { result: true, message, data } });

beforeEach(() => {
  axiosMock.mockReset();
  resetAiStatus();
  sessionStorage.clear();
  window.HTMLElement.prototype.scrollTo = vi.fn();
});

describe('AI chat on the hall page', () => {
  it('stays hidden when AI is off', async () => {
    axiosMock.mockImplementation(() => ok({ enabled: false }));
    render(<MemoryRouter><AiChat mahalId={1} hallName="Lakshmi Mahal" /></MemoryRouter>);
    await waitFor(() => expect(axiosMock).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /ask ai/i })).toBeNull();
  });

  it('chats, keeps the chat id, and links to the booking it created', async () => {
    axiosMock.mockImplementation((c) => {
      if (c.url === 'MahalAi/Status') return ok({ enabled: true });
      if (c.url === 'MahalAi/Chat' && c.data.message === 'Price?') return ok({ chatId: 'c1', reply: 'Lakshmi Mahal is ₹75,000 per day.', bookingRef: null });
      if (c.url === 'MahalAi/Chat') return ok({ chatId: 'c1', reply: 'Done! Reference MBX1.', bookingRef: 'MBX1' });
      return ok({});
    });
    render(<MemoryRouter><AiChat mahalId={1} hallName="Lakshmi Mahal" /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /ask ai/i }));
    const panel = await screen.findByRole('region', { name: /ai booking assistant/i });
    expect(within(panel).getByText(/I can tell you about Lakshmi Mahal/)).toBeTruthy();

    fireEvent.change(within(panel).getByLabelText('Message'), { target: { value: 'Price?' } });
    fireEvent.click(within(panel).getByRole('button', { name: 'Send' }));
    expect(await within(panel).findByText('Lakshmi Mahal is ₹75,000 per day.')).toBeTruthy();
    const first = axiosMock.mock.calls.find((c) => c[0].url === 'MahalAi/Chat')[0];
    expect(first.data).toEqual({ message: 'Price?', chatId: null, mahalId: 1 });

    fireEvent.change(within(panel).getByLabelText('Message'), { target: { value: 'yes book it' } });
    fireEvent.keyDown(within(panel).getByLabelText('Message'), { key: 'Enter' });
    const link = await within(panel).findByRole('link', { name: /check booking MBX1/i });
    expect(link.getAttribute('href')).toBe('/mahals/status?ref=MBX1');
    const second = axiosMock.mock.calls.filter((c) => c[0].url === 'MahalAi/Chat')[1][0];
    expect(second.data.chatId).toBe('c1');
  });

  it('shows the server message when the AI is busy', async () => {
    axiosMock.mockImplementation((c) => (c.url === 'MahalAi/Status' ? ok({ enabled: true }) : Promise.resolve({ data: { result: false, message: 'Our AI helper is busy right now.' } })));
    render(<MemoryRouter><AiChat /></MemoryRouter>);
    fireEvent.click(await screen.findByRole('button', { name: /ask ai/i }));
    fireEvent.click(await screen.findByText('Halls for 500 guests'));
    expect(await screen.findByText('Our AI helper is busy right now.')).toBeTruthy();
  });
});

describe('type or speak a booking', () => {
  it('turns a draft into booking form fields', () => {
    expect(draftToForm({ mahalId: 2, customerName: 'Ravi', phone: '9876543210', eventType: 'Marriage', fromDate: '2026-12-12', toDate: '2026-12-12', startTime: '06:00', endTime: null, guestCount: 500, totalAmount: 75000, discount: null, advance: 20000, payMethod: 'UPI' })).toEqual({
      mahalId: 2, customerName: 'Ravi', primary_phone: '9876543210', eventType: 'Marriage', guestCount: '500',
      fromDate: '2026-12-12T06:00', toDate: '2026-12-12T22:00', totalAmount: '75000', advance: '20000', payMethod: 'UPI',
    });
    // an evening start on a one-day booking ends the next morning
    expect(draftToForm({ fromDate: '2026-12-31', toDate: '2026-12-31', startTime: '23:00' })).toMatchObject({ fromDate: '2026-12-31T23:00', toDate: '2027-01-01T06:00' });
  });

  it('sends the note and hands back the draft', async () => {
    const draft = { mahalId: 1, customerName: 'Ravi', missing: [] };
    axiosMock.mockImplementation((c) => (c.url === 'MahalAi/ParseBooking' ? ok(draft) : ok({})));
    const onDraft = vi.fn();
    render(<AiQuickBooking mahalId={1} onDraft={onDraft} />);
    fireEvent.click(screen.getByRole('button', { name: /fill with ai/i }));
    expect(await screen.findByText(/type or speak the booking first/i)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Booking in your words'), { target: { value: 'Ravi 98765 43210 marriage 12 Dec' } });
    fireEvent.click(screen.getByRole('button', { name: /fill with ai/i }));
    await waitFor(() => expect(onDraft).toHaveBeenCalledWith(draft));
    expect(axiosMock.mock.calls.at(-1)[0].data).toEqual({ text: 'Ravi 98765 43210 marriage 12 Dec', mahalId: 1 });
  });
});

describe('follow-ups', () => {
  const items = [
    { id: 7, kind: 'balance', status: 'Open', message: null, customerName: 'Ravi', phone: '9876543210', mahalName: 'Lakshmi Mahal', eventType: 'Marriage', fromDate: '2026-11-27T06:00:00', toDate: '2026-11-27T22:00:00', balance: 55000 },
    { id: 8, kind: 'thanks', status: 'Sent', message: 'Thank you!', customerName: 'Priya', phone: '9876500000', mahalName: 'Lakshmi Mahal', eventType: 'Reception', fromDate: '2026-11-22T06:00:00', toDate: '2026-11-22T22:00:00', balance: 0 },
  ];

  it('writes the message with AI and sends it on WhatsApp', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const onCount = vi.fn();
    axiosMock.mockImplementation((c) => {
      if (c.url === 'MahalAi/FollowUps') return ok({ items, open: 1, aiEnabled: true });
      if (c.url === 'MahalAi/FollowUps/Draft') return ok({ id: 7, message: `வணக்கம் ரவி! மீதி ₹55,000.`, lang: c.data.lang });
      return ok({ id: 7, status: 'Sent' });
    });
    render(<FollowUpsPanel onCount={onCount} />);
    expect(await screen.findByText('Ravi')).toBeTruthy();
    expect(screen.getByText('Balance due')).toBeTruthy();
    expect(onCount).toHaveBeenCalledWith(1);
    expect(screen.getByRole('button', { name: /whatsapp/i }).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'தமிழ்' }));
    fireEvent.click(screen.getByRole('button', { name: /write with ai/i }));
    const box = await screen.findByLabelText('Message to Ravi');
    expect(box.value).toContain('₹55,000');
    expect(axiosMock.mock.calls.find((c) => c[0].url === 'MahalAi/FollowUps/Draft')[0].data).toEqual({ id: 7, lang: 'ta' });

    fireEvent.click(screen.getByRole('button', { name: /whatsapp/i }));
    expect(open).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/919876543210?text='), '_blank', 'noopener');
    await waitFor(() => expect(axiosMock.mock.calls.some((c) => c[0].url === 'MahalAi/FollowUps/Mark' && c[0].data.status === 'Sent')).toBe(true));
    open.mockRestore();
  });

  it('shows all caught up when there is nothing to send', async () => {
    axiosMock.mockImplementation(() => ok({ items: [], open: 0, aiEnabled: true }));
    render(<FollowUpsPanel />);
    expect(await screen.findByText('All caught up')).toBeTruthy();
  });
});
