/** Mahal Phase 1: WhatsApp messages, invoice page, reminders card, staff-only limits. */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

import { hallMessage, printInvoice, waDigits, waLink } from '../components/mahal/hallMessages';
import RemindersCard from '../components/mahal/RemindersCard';
import { isStaffUser } from '../api/mahalOps';

const ok = (data) => Promise.resolve({ data: { result: true, message: 'OK', data } });
const row = { kind: 'balance', bookingId: 7, bookingRef: 'MB7K3Q9P', customerName: 'Ravi', phone: '98765 43210', eventType: 'Marriage', fromDate: '2026-12-10T06:00:00', toDate: '2026-12-11T00:00:00', mahalName: 'Lakshmi Mahal', hallPhone: '9000000000', balance: 25000 };

beforeEach(() => {
  axiosMock.mockReset();
  localStorage.clear();
});

describe('hall messages', () => {
  it('builds English and Tamil reminders with the amount and reference', () => {
    expect(hallMessage('balance', row, 'en')).toMatch(/Ravi.*Lakshmi Mahal.*₹25,000.*MB7K3Q9P/);
    expect(hallMessage('balance', row, 'ta')).toMatch(/வணக்கம் Ravi/);
    expect(hallMessage('moitech', row, 'en')).toMatch(/mysuccess\.azurewebsites\.net\/purchase/);
  });
  it('adds India code to 10 digit numbers for WhatsApp', () => {
    expect(waDigits('98765 43210')).toBe('919876543210');
    expect(waLink('+91 98765 43210', 'hi')).toBe('https://wa.me/919876543210?text=hi');
  });
});

describe('invoice page', () => {
  it('escapes names and shows GST split', () => {
    const written = [];
    vi.spyOn(window, 'open').mockReturnValue({ document: { open: vi.fn(), write: (h) => written.push(h), close: vi.fn() } });
    const okOpen = printInvoice({
      invoiceNumber: 'INV-3-0001', invoiceDate: '2026-11-25T10:00:00',
      hall: { mahalName: 'Sri <Lakshmi>', gstEnabled: true, gstin: '33ABCDE1234F1Z5', gstRate: 18, addressLine1: 'Main Road' },
      booking: { customerName: 'Ravi & Co', primary_phone: '9876543210', fromDate: '2026-12-10T06:00:00', toDate: '2026-12-11T00:00:00', bookingRef: 'MB1' },
      amounts: { rent: 118000, discount: 0, total: 118000, taxable: 100000, cgst: 9000, sgst: 9000, paid: 50000, balance: 68000 },
      payments: [],
    });
    expect(okOpen).toBe(true);
    expect(written[0]).toContain('Sri &lt;Lakshmi&gt;');
    expect(written[0]).toContain('Ravi &amp; Co');
    expect(written[0]).toContain('TAX INVOICE');
    expect(written[0]).toContain('CGST @ 9%');
  });
});

describe('RemindersCard', () => {
  it('lists reminders and marks one sent when WhatsApp opens', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    axiosMock.mockImplementation((cfg) => (cfg.url === 'MahalOps/Reminders' ? ok([row]) : ok(null)));
    render(<MemoryRouter><RemindersCard /></MemoryRouter>);
    expect(await screen.findByText(/Balance due · Ravi/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Send/ }));
    expect(open.mock.calls[0][0]).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/);
    await waitFor(() => expect(axiosMock.mock.calls.map((c) => c[0]).find((c) => c.url === 'MahalOps/Reminders/Mark')?.data).toEqual({ bookingId: 7, kind: 'balance' }));
    expect(screen.queryByText(/Balance due · Ravi/)).toBeNull();
  });
});

describe('staff login', () => {
  it('is detected from the saved user', () => {
    expect(isStaffUser()).toBe(false);
    localStorage.setItem('user', JSON.stringify({ userType: 'MS' }));
    expect(isStaffUser()).toBe(true);
  });
});
