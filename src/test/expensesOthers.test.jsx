/** New Expenses, Add Others and their lists. */
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

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};
const saveCalls = () => axiosMock.mock.calls.filter(([c]) => /UpdateTransaction$/.test(c?.url || ''));

describe('Expenses and others', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify(admin));
    window.matchMedia = (q) => ({ matches: /min-width/.test(q), media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() {} });
    axiosMock.mockImplementation(({ url, params }) => {
      if (/GetTransaction/.test(url)) {
        const byType = {
          E: [{ id: 5, villageName: 'catering', name: 'Annapoorna Caterers', amount: 45000, phoneNo: '', isActive: true }],
          O: [{ id: 6, villageName: 'Theni', name: 'Meena', initial: 'S', others: 2, othersType: 'coin', othersRemark: '1 gram each', amount: 0, phoneNo: '', isActive: true }],
        };
        return Promise.resolve({ data: { result: true, data: { transactions: byType[params.trans_type] || [], totalPages: 1 } } });
      }
      if (/UpdateTransaction$/.test(url)) return Promise.resolve({ data: { result: true, data: { transaction: { name: 'Meena', villageName: 'Theni', others: 2, othersType: 'coin' }, totalTrans: 4, totalAmount: 0 } } });
      return Promise.resolve({ data: { result: true, data: [] } });
    });
  });

  it('saves an expense with its category as type E', async () => {
    await renderAt('/addExpenses');
    fireEvent.mouseDown(await screen.findByRole('combobox', { name: /expenses category/i }, { timeout: 8000 }));
    fireEvent.click(await screen.findByRole('option', { name: /catering/i }));
    fireEvent.change(screen.getByRole('textbox', { name: /cash recipient name/i }), { target: { name: 'name', value: 'Annapoorna Caterers' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /amount/i }), { target: { name: 'amount', value: '45000' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => expect(saveCalls()).toHaveLength(1));
    expect(saveCalls()[0][0].data).toMatchObject({ type: 'E', villageName: 'catering', name: 'Annapoorna Caterers', amount: '45000', functionId: 3 });
    // Appears in "saved just now" and the form is cleared.
    expect(await screen.findByText('Annapoorna Caterers')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('textbox', { name: /cash recipient name/i })).toHaveValue(''));
  });

  it('does not save an expense without a category', async () => {
    await renderAt('/addExpenses');
    fireEvent.click(await screen.findByRole('button', { name: /^save$/i }, { timeout: 8000 }));
    expect(await screen.findByText(/please choose a category/i)).toBeInTheDocument();
    expect(saveCalls()).toHaveLength(0);
  });

  it('saves a gift (others) with its type as type O', async () => {
    await renderAt('/others');
    fireEvent.change(await screen.findByRole('textbox', { name: /village/i }, { timeout: 8000 }), { target: { name: 'villageName', value: 'Theni' } });
    fireEvent.change(screen.getByRole('textbox', { name: /^name/i }), { target: { name: 'name', value: 'Meena' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    expect(await screen.findByText(/please select an option/i)).toBeInTheDocument();
    expect(saveCalls()).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: /coin/i }));
    fireEvent.change(screen.getByRole('spinbutton', { name: /^others/i }), { target: { name: 'others', value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /^save$/i }));
    await waitFor(() => expect(saveCalls()).toHaveLength(1));
    expect(saveCalls()[0][0].data).toMatchObject({ type: 'O', villageName: 'Theni', name: 'Meena', othersType: 'coin', others: '2' });
    expect(await screen.findByText('2 × Coin')).toBeInTheDocument();
  });

  it('expenses list shows category and description, and edits with the expense form', async () => {
    await renderAt('/expenses-list');
    expect(await screen.findByText('Annapoorna Caterers', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(axiosMock.mock.calls.find(([c]) => /GetTransaction/.test(c?.url || ''))[0].params.trans_type).toBe('E');
    fireEvent.click(screen.getByRole('button', { name: /edit annapoorna/i }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('combobox', { name: /expenses category/i })).toBeInTheDocument();
  });

  it('others list shows the gift type and count', async () => {
    await renderAt('/others-list');
    expect(await screen.findByText('Meena', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getByText('1 gram each')).toBeInTheDocument();
    expect(axiosMock.mock.calls.find(([c]) => /GetTransaction/.test(c?.url || ''))[0].params.trans_type).toBe('O');
  });
});
