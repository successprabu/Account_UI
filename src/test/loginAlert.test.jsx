/** The login page shows the red message only for a real problem, and clears it when the user types again. */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getMock = vi.fn();
const postMock = vi.fn();
vi.mock('axios', () => {
  const instance = Object.assign(vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })), {
    get: (...a) => getMock(...a),
    post: (...a) => postMock(...a),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  });
  instance.create = () => instance;
  return { default: instance };
});

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Login alert', () => {
  beforeEach(() => {
    localStorage.clear();
    getMock.mockReset();
    postMock.mockReset();
    getMock.mockResolvedValue({ data: { result: true, data: [{ userType: 'AU', userTypeDescription: 'Admin' }] } });
  });

  it('no red bar when nothing is wrong (leaving the mobile field, or an incomplete number)', async () => {
    await renderAt('/login');
    const phone = await screen.findByLabelText(/mobile number/i, {}, { timeout: 5000 });
    fireEvent.change(phone, { target: { name: 'username', value: '95244' } });
    fireEvent.blur(phone);
    fireEvent.change(phone, { target: { name: 'username', value: '9524410585' } });
    fireEvent.blur(phone);
    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('a wrong password shows a clear message, which goes away when the user types again', async () => {
    postMock.mockRejectedValue({ response: { status: 400, data: { result: false, message: 'Invalid User' } } });
    await renderAt('/login');
    const phone = await screen.findByLabelText(/mobile number/i, {}, { timeout: 5000 });
    fireEvent.change(phone, { target: { name: 'username', value: '9524410585' } });
    fireEvent.blur(phone);
    const password = screen.getByLabelText(/^password/i);
    fireEvent.change(password, { target: { name: 'password', value: 'wrong12' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/wrong mobile number or password/i);
    fireEvent.change(password, { target: { name: 'password', value: 'right12' } });
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
