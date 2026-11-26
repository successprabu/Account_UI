/** Forgot password, change password, and the sign-up choice on the login page. */
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
const admin = { id: 1, name: 'Kumar', primary_phone: '9876500000', userType: 'AU', userTypeDescription: 'Admin', customerID: 1, functionId: 1, token };

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};
const call = (url) => axiosMock.mock.calls.find(([c]) => c?.url === url)?.[0];

describe('Passwords and sign-up', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
    axiosMock.mockResolvedValue({ data: { result: true, message: 'ok', data: {} } });
  });

  it('forgot password: OTP to the mobile, then a new password', async () => {
    await renderAt('/forgot-password');
    const phone = await screen.findByLabelText(/registered mobile number/i, {}, { timeout: 5000 });
    fireEvent.click(screen.getByRole('button', { name: 'Send OTP' }));
    expect(await screen.findByText(/10 digit registered mobile/i)).toBeInTheDocument();
    fireEvent.change(phone, { target: { value: '9876500000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send OTP' }));
    await waitFor(() => expect(call('Auth/ForgotPassword')?.data).toEqual({ phone: '9876500000' }));

    fireEvent.change(await screen.findByLabelText('OTP'), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'new12345' } });
    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'different' } });
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }));
    expect(await screen.findByText('The passwords do not match')).toBeInTheDocument();
    expect(call('Auth/ResetPassword')).toBeUndefined();

    fireEvent.change(screen.getByLabelText('Confirm new password'), { target: { value: 'new12345' } });
    fireEvent.click(screen.getByRole('button', { name: 'Change password' }));
    await waitFor(() => expect(call('Auth/ResetPassword')?.data).toEqual({ phone: '9876500000', otp: '123456', newPassword: 'new12345' }));
    expect(await screen.findByText('Password changed')).toBeInTheDocument();
  });

  it('shows the server message when the number has no account', async () => {
    axiosMock.mockRejectedValueOnce({ response: { status: 400, data: { result: false, message: 'No active account uses this mobile number. Check the number, or sign up.' } } });
    await renderAt('/forgot-password');
    fireEvent.change(await screen.findByLabelText(/registered mobile number/i, {}, { timeout: 5000 }), { target: { value: '9999999999' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send OTP' }));
    expect(await screen.findByText(/No active account uses this mobile number/)).toBeInTheDocument();
  });

  it('sign up offers DigiMoi, Mahal Management and School', async () => {
    await renderAt('/login');
    fireEvent.click(await screen.findByRole('button', { name: /sign up/i }, { timeout: 5000 }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('link', { name: /DigiMoi/ })).toHaveAttribute('href', '/purchase');
    expect(within(dialog).getByRole('link', { name: /Mahal Management/ })).toHaveAttribute('href', '/mahal-reg');
    expect(within(dialog).getByRole('link', { name: /School Website/ }).getAttribute('href')).toMatch(/register-school$/);
  });

  it('change password from the profile menu sends the current and new password with the login', async () => {
    localStorage.setItem('user', JSON.stringify(admin));
    await renderAt('/dashboard');
    fireEvent.click(await screen.findByText('Kumar', {}, { timeout: 5000 }));
    fireEvent.click(await screen.findByRole('menuitem', { name: /change password/i }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Current password'), { target: { value: 'old123' } });
    fireEvent.change(within(dialog).getByLabelText('New password'), { target: { value: 'new12345' } });
    fireEvent.change(within(dialog).getByLabelText('Confirm new password'), { target: { value: 'new12345' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Change password' }));
    await waitFor(() => expect(call('Auth/ChangePassword')).toBeDefined());
    expect(call('Auth/ChangePassword').data).toEqual({ currentPassword: 'old123', newPassword: 'new12345' });
    expect(call('Auth/ChangePassword').headers.Authorization).toBe(`Bearer ${token}`);
  });
});
