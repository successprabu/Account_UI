/** Receipt list: search, clear and delete. */
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
const admin = { id: 9, name: 'Kumar', userType: 'AU', primary_phone: '9876500000', customerID: 9, functionId: 3, token };
const rows = [
  { id: 1, villageName: 'Madurai', initial: 'K', name: 'Ravi', oldAmount: 0, newAmount: 501, amount: 501, phoneNo: '9000000001', isActive: true },
  { id: 2, villageName: 'Theni', initial: '', name: 'Meena', oldAmount: 1000, newAmount: 0, amount: 1000, phoneNo: '', isActive: true },
];

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};
const listCalls = () => axiosMock.mock.calls.filter(([c]) => /GetTransaction/.test(c?.url || ''));

describe('Receipt list', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify(admin));
    window.matchMedia = (q) => ({ matches: /min-width/.test(q), media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} });
    axiosMock.mockImplementation(({ url, params }) => {
      if (/GetTransaction/.test(url)) {
        const list = params.customer_name ? rows.filter((r) => r.name.includes(params.customer_name)) : rows;
        return Promise.resolve({ data: { result: true, data: { transactions: list, totalPages: 1 } } });
      }
      return Promise.resolve({ data: { result: true, data: {} } });
    });
  });

  it('lists receipts with the page total', async () => {
    await renderAt('/transaction-list');
    expect(await screen.findByText('Ravi', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getByText('Meena')).toBeInTheDocument();
    expect(screen.getAllByText('₹1,501').length).toBeGreaterThan(0);
    expect(listCalls()[0][0].params).toMatchObject({ customer_id: 9, trans_type: 'R', current_page: 1 });
  });

  it('searches by name and Clear brings everything back', async () => {
    await renderAt('/transaction-list');
    await screen.findByText('Meena', {}, { timeout: 8000 });
    fireEvent.change(screen.getAllByRole('textbox', { name: /name/i })[0], { target: { value: 'Ravi' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => expect(screen.queryByText('Meena')).not.toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('button', { name: /clear/i })[0]);
    expect(await screen.findByText('Meena')).toBeInTheDocument();
  });

  it('deletes a receipt after confirming', async () => {
    await renderAt('/transaction-list');
    fireEvent.click(await screen.findByRole('button', { name: /delete ravi/i }, { timeout: 8000 }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /delete/i }));
    await waitFor(() => expect(screen.queryByText('Ravi')).not.toBeInTheDocument());
    const del = axiosMock.mock.calls.find(([c]) => /DeleteTransaction/.test(c?.url || ''));
    expect(del[0].params).toMatchObject({ id: 1, deletedBy: '9876500000' });
  });
});
