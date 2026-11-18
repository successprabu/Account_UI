/** Moi we gave: admin records moi given at others' functions and sees give & take per person. */
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
const admin = { id: 1, name: 'Kumar', userType: 'AU', userTypeDescription: 'Admin', customerID: 1, functionId: 1, token };

const compare = {
  items: [
    { key: 'p:9876543210', name: 'Ravi', place: 'Madurai', phone: '9876543210', weGave: 1001, theyGave: 3002, difference: 2001, status: 'theyMore', gave: [{ id: 5, amount: 1001, eventName: 'Ravi brother wedding', eventDate: '2025-05-10T00:00:00' }], got: [{ id: 11, amount: 2001, functionName: 'Ravi Wedding' }, { id: 12, amount: 1001, functionName: 'House warming' }] },
    { key: 'n:selvam|usilampatti', name: 'Selvam', place: 'Usilampatti', weGave: 2001, theyGave: 0, difference: -2001, status: 'onlyWe', gave: [{ id: 6, amount: 2001, eventName: 'Selvam house warming' }], got: [] },
    { key: 'n:selvem|usilampatti', name: 'Selvem', place: 'Usilampatti', weGave: 0, theyGave: 1501, difference: 1501, status: 'onlyThey', gave: [], got: [{ id: 13, amount: 1501, functionName: 'Ravi Wedding' }] },
  ],
  counts: { all: 3, theyMore: 1, weMore: 0, even: 0, onlyWe: 1, onlyThey: 1 },
  totals: { weGave: 3002, theyGave: 4503 },
  functions: [{ id: 1, functionName: 'Ravi Wedding' }, { id: 2, functionName: 'House warming' }],
};
const list = { items: [{ id: 5, name: 'Ravi K', place: 'Madurai Town', phone: '9876543210', amount: 1001, eventName: 'Ravi brother wedding' }], total: 1, all: 1, totalAmount: 1001 };

const api = () =>
  axiosMock.mockImplementation((c) => {
    if (c.url === 'MoiGiven/Compare') return Promise.resolve({ data: { result: true, data: compare } });
    if (c.url === 'MoiGiven/List') return Promise.resolve({ data: { result: true, data: list } });
    return Promise.resolve({ data: { result: true, message: 'Saved', data: {} } });
  });

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Moi we gave', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify(admin));
    api();
  });

  it('shows give & take per person with advice, and each gift when opened', async () => {
    await renderAt('/moi-given');
    expect(await screen.findByText(/Return at least ₹3,002 at their next function/, {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('They have not given at our functions yet.')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ravi'));
    expect(await screen.findByText('Ravi brother wedding · 10 May 2025')).toBeInTheDocument();
    expect(screen.getByText('House warming')).toBeInTheDocument();
  });

  it('filters by status and asks the API for one function', async () => {
    await renderAt('/moi-given');
    await screen.findByText(/Return at least ₹3,002/, {}, { timeout: 5000 });
    fireEvent.click(screen.getByRole('tab', { name: 'Only we gave (1)' }));
    await waitFor(() => expect(screen.queryByText('Ravi')).not.toBeInTheDocument());
    expect(screen.getByText('Selvam')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByLabelText('Our function'));
    fireEvent.click(await screen.findByRole('option', { name: 'House warming' }));
    await waitFor(() => expect(axiosMock.mock.calls.some(([c]) => c.url === 'MoiGiven/Compare' && c.params.function_id === 2)).toBe(true));
  });

  it('links a person who gave under another spelling', async () => {
    await renderAt('/moi-given');
    await screen.findByText('Selvam', {}, { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: /gave under another name\? link/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByText('Selvem'));
    await waitFor(() => expect(axiosMock.mock.calls.some(([c]) => c.url === 'MoiGiven/Link')).toBe(true));
    expect(axiosMock.mock.calls.find(([c]) => c.url === 'MoiGiven/Link')[0].data).toEqual({ givenId: 6, transactionId: 13 });
  });

  it('adds an entry with the function name and date', async () => {
    await renderAt('/moi-given?view=list');
    await screen.findByText('Ravi K', {}, { timeout: 5000 });
    fireEvent.click(screen.getAllByRole('button', { name: /add moi we gave/i })[0]);
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    expect(await within(dialog).findByText('Enter the name')).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText(/^Name/), { target: { value: 'Arun' } });
    fireEvent.change(within(dialog).getByLabelText(/Place/), { target: { value: 'Theni' } });
    fireEvent.change(within(dialog).getByLabelText(/Amount we gave/), { target: { value: '1001' } });
    fireEvent.change(within(dialog).getByLabelText(/Their function/), { target: { value: 'Arun wedding' } });
    fireEvent.change(within(dialog).getByLabelText(/Date of their function/), { target: { value: '2025-06-01' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(axiosMock.mock.calls.some(([c]) => c.url === 'MoiGiven/Save')).toBe(true));
    expect(axiosMock.mock.calls.find(([c]) => c.url === 'MoiGiven/Save')[0].data).toMatchObject({ id: 0, name: 'Arun', place: 'Theni', amount: 1001, eventName: 'Arun wedding', eventDate: '2025-06-01' });
  });

  it('deletes only after confirming', async () => {
    await renderAt('/moi-given?view=list');
    fireEvent.click(await screen.findByRole('button', { name: 'Delete Ravi K' }, { timeout: 5000 }));
    expect(axiosMock.mock.calls.some(([c]) => c.url === 'MoiGiven/Delete')).toBe(false);
    fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(axiosMock.mock.calls.find(([c]) => c.url === 'MoiGiven/Delete')?.[0].params).toEqual({ id: 5 }));
  });

  it('is not open to helpers', async () => {
    localStorage.setItem('user', JSON.stringify({ ...admin, userType: 'NU' }));
    await renderAt('/moi-given');
    await waitFor(() => expect(window.location.pathname).toBe('/unauthorized'), { timeout: 5000 });
  });
});
