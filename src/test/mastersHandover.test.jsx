/** Function, User and Handover screens. */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

const token = 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp: 4102444800 })).replace(/=+$/, '') + '.';
const admin = (functionId = 3) => ({ id: 9, name: 'Kumar', userType: 'AU', primary_phone: '9876500000', customerID: 9, functionId, token });

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};
const calls = (re) => axiosMock.mock.calls.filter(([c]) => re.test(c?.url || ''));
const stored = () => JSON.parse(localStorage.getItem('user'));

let functions = [];
beforeEach(() => {
  axiosMock.mockReset();
  localStorage.clear();
  window.matchMedia = (q) => ({ matches: /min-width/.test(q), media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} });
  functions = [
    { id: 3, customerId: 9, functionName: 'Wedding', functionDate: '2026-12-12T00:00:00', mahalName: 'Lakshmi Mahal', funPersionNames: 'Ravi & Priya', remarks: '', funMessage: '', isActive: true },
    { id: 4, customerId: 9, functionName: 'Ear piercing', functionDate: '2027-01-20T00:00:00', mahalName: 'Home', funPersionNames: 'Baby Anu', remarks: '', funMessage: '', isActive: true },
  ];
  axiosMock.mockImplementation(({ url, data }) => {
    if (/GetFunction/.test(url)) return Promise.resolve({ data: { result: true, data: { functions } } });
    if (/UpdateCustomerFunction/.test(url)) return Promise.resolve({ data: { result: true, data: { ...data, id: data.id || 77 } } });
    if (/GetCustomer/.test(url)) return Promise.resolve({ data: { result: true, data: { customers: [{ id: 21, name: 'Selvi', primary_phone: '9000000001', is_primary_phone_whatsup: true, isActive: true, userType: 'NU', password: 'x' }] } } });
    if (/AddCustomer|UpdateCustomer/.test(url)) return Promise.resolve({ data: { result: true, data: {} } });
    if (/GetOverallSummaryReport/.test(url)) return Promise.resolve({ data: { result: true, data: [
      { createdBy: 'Selvi', createdById: 21, type: 'R', total: 50000 },
      { createdBy: 'Selvi', createdById: 21, type: 'E', total: 5000 },
      { createdBy: 'Kumar', createdById: 9, type: 'R', total: 20000 },
    ] } });
    if (/GetOthersSummaryReport/.test(url)) return Promise.resolve({ data: { result: true, data: [{ othersType: 'coin', totalOthers: 3 }] } });
    if (/UpdateHandover/.test(url)) return Promise.resolve({ data: { result: true, data: {} } });
    return Promise.resolve({ data: { result: true, data: [] } });
  });
});

describe('Function', () => {
  it('the first function saved becomes the current one, so receipts can be saved straight away', async () => {
    functions = [];
    localStorage.setItem('user', JSON.stringify(admin(0)));
    await renderAt('/function');
    fireEvent.change(await screen.findByRole('textbox', { name: /function name/i }, { timeout: 8000 }), { target: { value: 'Wedding' } });
    fireEvent.change(screen.getByLabelText(/function date/i), { target: { value: '2026-12-12' } });
    fireEvent.change(screen.getByRole('textbox', { name: /mahal name/i }), { target: { value: 'Lakshmi Mahal' } });
    fireEvent.change(screen.getByRole('textbox', { name: /function hero/i }), { target: { value: 'Ravi & Priya' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => expect(calls(/UpdateCustomerFunction/)).toHaveLength(1));
    expect(calls(/UpdateCustomerFunction/)[0][0].data).toMatchObject({ functionName: 'Wedding', functionDate: '2026-12-12', customerId: 9 });
    await waitFor(() => expect(stored().functionId).toBe(77));
  });

  it('edit keeps the date, and "Use this function" switches where entries are saved', async () => {
    localStorage.setItem('user', JSON.stringify(admin(3)));
    await renderAt('/function');
    expect(await screen.findByText('Entries are saved here', {}, { timeout: 8000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /edit ear piercing/i }));
    await waitFor(() => expect(screen.getByLabelText(/function date/i)).toHaveValue('2027-01-20'));
    fireEvent.click(screen.getByRole('button', { name: /use this function/i }));
    await waitFor(() => expect(stored().functionId).toBe(4));
  });
});

describe('User', () => {
  it('every new user belongs to the account and is active, not just the first', async () => {
    localStorage.setItem('user', JSON.stringify(admin()));
    await renderAt('/user');
    expect(await screen.findByText('Selvi', {}, { timeout: 8000 })).toBeInTheDocument();
    const add = async (name, phone) => {
      fireEvent.change(screen.getByRole('textbox', { name: /^name/i }), { target: { value: name } });
      fireEvent.change(screen.getByRole('textbox', { name: /mobile number/i }), { target: { value: phone } });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'secret1' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'secret1' } });
      fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    };
    await add('Arun', '9000000002');
    await waitFor(() => expect(calls(/AddCustomer/)).toHaveLength(1));
    await waitFor(() => expect(screen.getByRole('textbox', { name: /^name/i })).toHaveValue(''));
    await add('Bala', '9000000003');
    await waitFor(() => expect(calls(/AddCustomer/)).toHaveLength(2));
    for (const [cfg] of calls(/AddCustomer/)) expect(cfg.data).toMatchObject({ customerId: 9, isActive: true, userType: 'NU', createdBy: '9' });
  });
});

describe('Handover', () => {
  it('shows each collector total and records the handover for the current function', async () => {
    localStorage.setItem('user', JSON.stringify(admin(3)));
    await renderAt('/handover');
    expect(await screen.findByText('Selvi', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getByText('₹45,000')).toBeInTheDocument();
    const row = screen.getByText('Selvi').closest('tr');
    fireEvent.click(within(row).getByRole('button', { name: /handover/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByRole('spinbutton', { name: /handover amount/i }), { target: { value: '45000' } });
    fireEvent.change(within(dialog).getByRole('textbox', { name: /received by/i }), { target: { value: 'Kumar' } });
    fireEvent.click(within(dialog).getByRole('button', { name: /^save$/i }));
    await waitFor(() => expect(calls(/UpdateHandover/)).toHaveLength(1));
    expect(calls(/UpdateHandover/)[0][0].data).toMatchObject({ functionId: 3, customerId: 9, handoverBy: 21, totalRcdAmount: 50000, handoverAmount: 45000, differnceAmount: 5000, receivedBy: 'Kumar' });
  });
});
