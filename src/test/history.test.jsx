/** Moitech history: the admin sees who added, edited or deleted what; helpers cannot open it. */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
const admin = { id: 1, name: 'Kumar', userType: 'AU', userTypeDescription: 'Admin', customerID: 1, functionId: 7, token };
const helper = { ...admin, id: 2, name: 'Selvi', userType: 'NU', userTypeDescription: 'User' };

const history = {
  items: [
    { id: 3, entity: 'Receipt', recordId: 11, action: 'Deleted', name: 'K Meena', place: 'Theni', amountBefore: 5000, amountAfter: null, changes: [{ field: 'active', from: 'Yes', to: 'No' }], changedById: 2, changedByName: 'Selvi', changedAt: '2026-11-18T05:32:00Z' },
    { id: 2, entity: 'Receipt', recordId: 10, action: 'Edited', name: 'K Ravi', place: 'Madurai', amountBefore: 1001, amountAfter: 101, changes: [{ field: 'amount', from: '1001', to: '101' }], changedById: 2, changedByName: 'Selvi', changedAt: '2026-11-18T05:31:00Z' },
    { id: 1, entity: 'Others', recordId: 12, action: 'Added', name: 'S Priya', place: 'Theni', amountBefore: null, amountAfter: 0, snapshot: { others: '2', othersType: 'coin', othersRemark: '1 gram each' }, changedById: 2, changedByName: 'Selvi', changedAt: '2026-11-18T05:30:00Z' },
  ],
  total: 3,
  counts: { all: 3, added: 1, edited: 1, deleted: 1, restored: 0, handover: 0 },
  people: [{ changedById: 2, name: 'Selvi', added: 1, edited: 1, deleted: 1, restored: 0, handovers: 0, reduced: 5900, last: '2026-11-18T05:32:00Z' }],
};

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Moitech history', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
  });

  it('shows each change, who made it and the money that went missing', async () => {
    localStorage.setItem('user', JSON.stringify(admin));
    axiosMock.mockResolvedValue({ data: { result: true, data: history } });
    await renderAt('/history');

    expect(await screen.findByText('5,900 reduced', { exact: false }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('K Ravi · Madurai')).toBeInTheDocument();
    expect(screen.getAllByText('₹1,001').length).toBeGreaterThan(0);
    expect(screen.getAllByText('₹101').length).toBeGreaterThan(0);
    expect(screen.getByText('₹900 less')).toBeInTheDocument();
    expect(screen.getByText('₹5,000 less')).toBeInTheDocument();
    expect(screen.getByText('2 coin · 1 gram each')).toBeInTheDocument();

    // Read only: loads from Transaction/History for the active function, and nothing offers to change it.
    const call = axiosMock.mock.calls.find(([c]) => c?.url === 'Transaction/History')[0];
    expect(call.method).toBe('get');
    expect(call.params.function_id).toBe(7);
    expect(screen.queryByRole('button', { name: /^(delete|remove|edit)/i })).not.toBeInTheDocument();
  });

  it('filters by action and by person', async () => {
    localStorage.setItem('user', JSON.stringify(admin));
    axiosMock.mockResolvedValue({ data: { result: true, data: history } });
    await renderAt('/history');
    await screen.findByText('5,900 reduced', { exact: false }, { timeout: 5000 });

    fireEvent.click(screen.getByRole('tab', { name: 'Deleted (1)' }));
    await waitFor(() => expect(axiosMock.mock.calls.at(-1)[0].params.action).toBe('Deleted'));

    fireEvent.click(screen.getByRole('button', { name: /Selvi/ }));
    await waitFor(() => expect(axiosMock.mock.calls.at(-1)[0].params.changed_by).toBe(2));
  });

  it('is not open to helpers', async () => {
    localStorage.setItem('user', JSON.stringify(helper));
    axiosMock.mockResolvedValue({ data: { result: true, data: history } });
    await renderAt('/history');
    await waitFor(() => expect(window.location.pathname).toBe('/unauthorized'), { timeout: 5000 });
    expect(axiosMock.mock.calls.some(([c]) => c?.url === 'Transaction/History')).toBe(false);
  });
});
