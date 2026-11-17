/** New receipt (moi entry) screen. */
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
const admin = { id: 9, name: 'Kumar', userType: 'AU', userTypeDescription: 'Admin', customerID: 9, functionId: 3, token };

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

const saveCalls = () => axiosMock.mock.calls.filter(([cfg]) => /Transaction\/UpdateTransaction$/.test(cfg?.url || ''));

const fill = async () => {
  fireEvent.change(await screen.findByRole('textbox', { name: /village/i }, { timeout: 8000 }), { target: { name: 'villageName', value: 'Madurai' } });
  fireEvent.change(screen.getByRole('textbox', { name: /^name/i }), { target: { name: 'name', value: 'Ravi' } });
  fireEvent.change(screen.getByRole('spinbutton', { name: /new amount/i }), { target: { name: 'newAmount', value: '501' } });
};

describe('New receipt', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
    localStorage.setItem('user', JSON.stringify(admin));
  });

  it('saves the receipt for the current function and clears the form for the next one', async () => {
    axiosMock.mockImplementation(({ url }) =>
      /UpdateTransaction$/.test(url)
        ? Promise.resolve({ data: { result: true, data: { transaction: { name: 'Ravi', villageName: 'Madurai', amount: 501 }, totalTrans: 12, totalAmount: 15001 } } })
        : Promise.resolve({ data: { result: true, data: [] } })
    );
    await renderAt('/transaction');
    await fill();
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(saveCalls()).toHaveLength(1));
    expect(saveCalls()[0][0].data).toMatchObject({ villageName: 'Madurai', name: 'Ravi', newAmount: '501', amount: 501, functionId: 3, customerId: 9, type: 'R' });
    // Last saved entry appears and the form is ready for the next person.
    expect(await screen.findByText('₹501')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('textbox', { name: /village/i })).toHaveValue(''));
  });

  it('does not save without village, name and an amount', async () => {
    await renderAt('/transaction');
    fireEvent.click(await screen.findByRole('button', { name: /save/i }, { timeout: 8000 }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: /village/i })).toHaveAttribute('aria-invalid', 'true'));
    expect(saveCalls()).toHaveLength(0);
  });

  it('lets the user try again after a failed save', async () => {
    axiosMock.mockImplementation(({ url }) =>
      /UpdateTransaction$/.test(url) ? Promise.reject({ response: { status: 500, data: { message: 'Server busy' } } }) : Promise.resolve({ data: { result: true, data: [] } })
    );
    await renderAt('/transaction');
    await fill();
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(saveCalls()).toHaveLength(1));
    // The button is usable again and the typed entry is kept.
    await waitFor(() => expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled());
    expect(screen.getByRole('textbox', { name: /^name/i })).toHaveValue('Ravi');
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await waitFor(() => expect(saveCalls()).toHaveLength(2));
  });
});
