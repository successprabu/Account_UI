/** "Ask us" chat box on the public MySuccess pages. */
import { fireEvent, render, screen } from '@testing-library/react';
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

import SupportChat from '../components/public/SupportChat';
import { resetSupportStatus } from '../api/supportAi';
import { FALLBACK, faqAnswer } from '../components/public/supportFaq';

const ok = (data) => Promise.resolve({ data: { result: true, message: 'OK', data } });
const aiOn = (on) => (cfg) => (cfg.url === 'SupportAi/Status' ? ok({ enabled: on }) : null);

const renderAt = (path = '/') => render(<MemoryRouter initialEntries={[path]}><SupportChat /></MemoryRouter>);
const ask = (text) => {
  fireEvent.change(screen.getByLabelText('Message'), { target: { value: text } });
  fireEvent.click(screen.getByLabelText('Send'));
};

beforeEach(() => {
  axiosMock.mockReset();
  resetSupportStatus();
  sessionStorage.clear();
  localStorage.clear();
  window.HTMLElement.prototype.scrollTo = vi.fn();
});

describe('built-in answers', () => {
  it('matches each product', () => {
    expect(faqAnswer('How much is Moitech?')).toMatch(/₹99\/month/);
    expect(faqAnswer('மண்டபம் booking software')).toMatch(/₹4,999/);
    expect(faqAnswer('school erp price')).toMatch(/₹29,999/);
    expect(faqAnswer('clinic software')).toMatch(/coming soon/);
    expect(faqAnswer('android app download')).toMatch(/download-app/);
  });
  it('falls back to a general answer', () => {
    expect(faqAnswer('hello there')).toBe(FALLBACK);
  });
});

describe('SupportChat', () => {
  it('answers from the FAQ when AI is off', async () => {
    axiosMock.mockImplementation(aiOn(false));
    renderAt('/');
    fireEvent.click(screen.getByLabelText('Chat with us'));
    ask('school erp price');
    expect(await screen.findByText(/Website \+ ERP ₹29,999\/year/)).toBeInTheDocument();
    expect(axiosMock).toHaveBeenCalledTimes(1); // only the status check
  });

  it('sends the question with history and page to the AI', async () => {
    axiosMock.mockImplementation((cfg) => aiOn(true)(cfg) || ok({ reply: 'Moitech starts at ₹99/month. See https://mysuccess.azurewebsites.net/pricing' }));
    renderAt('/services');
    fireEvent.click(screen.getByLabelText('Chat with us'));
    await screen.findByText(/replies in seconds/);
    ask('Moitech price?');
    expect(await screen.findByText(/starts at ₹99/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '/pricing' })).toHaveAttribute('href', '/pricing');
    const chat = axiosMock.mock.calls.map((c) => c[0]).find((c) => c.url === 'SupportAi/Chat');
    expect(chat.data).toEqual({ message: 'Moitech price?', history: [], page: '/services' });
  });

  it('falls back to the FAQ when the AI call fails', async () => {
    axiosMock.mockImplementation((cfg) => aiOn(true)(cfg) || Promise.reject({ response: { status: 500, data: {} } }));
    renderAt('/');
    fireEvent.click(screen.getByLabelText('Chat with us'));
    await screen.findByText(/replies in seconds/);
    ask('mahal booking');
    expect(await screen.findByText(/₹49,999\/year/)).toBeInTheDocument();
  });

  it('is hidden on hall pages and for signed-in users', () => {
    axiosMock.mockImplementation(aiOn(false));
    const { unmount } = renderAt('/mahals/12');
    expect(screen.queryByLabelText('Chat with us')).toBeNull();
    unmount();
    localStorage.setItem('user', JSON.stringify({ token: 't' }));
    renderAt('/');
    expect(screen.queryByLabelText('Chat with us')).toBeNull();
  });
});
