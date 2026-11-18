/** Sign-up OTP: the website asks our API to send and check the code; no SMS key or SMS call in the browser. */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMock = vi.fn();
const getMock = vi.fn();
vi.mock('axios', () => {
  const fn = (...args) => axiosMock(...args);
  const instance = Object.assign(fn, {
    get: (...args) => getMock(...args),
    post: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
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

describe('Sign-up OTP', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    getMock.mockReset();
    localStorage.clear();
    getMock.mockResolvedValue({ data: { result: true, message: 'Available' } });
    axiosMock.mockResolvedValue({ data: { result: true, message: 'ok' } });
  });

  it('sends and checks the code through Auth/SendOtp and Auth/VerifyOtp', async () => {
    await renderAt('/purchase');
    const phone = await screen.findByPlaceholderText(/primary phone/i, {}, { timeout: 5000 });
    fireEvent.change(phone, { target: { name: 'primary_phone', value: '9876543210' } });
    fireEvent.click(screen.getAllByRole('button', { name: /send otp/i })[0]);

    await waitFor(() => expect(axiosMock.mock.calls.some(([c]) => c?.url === 'Auth/SendOtp')).toBe(true));
    const sent = axiosMock.mock.calls.find(([c]) => c?.url === 'Auth/SendOtp')[0];
    expect(sent.data).toEqual({ phone: '9876543210', userType: 'AU', appName: 'MOI' });

    fireEvent.change(await screen.findByPlaceholderText(/enter otp/i), { target: { name: 'otp', value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: /verify otp/i }));
    await waitFor(() => expect(axiosMock.mock.calls.some(([c]) => c?.url === 'Auth/VerifyOtp')).toBe(true));
    expect(axiosMock.mock.calls.find(([c]) => c?.url === 'Auth/VerifyOtp')[0].data).toEqual({ phone: '9876543210', otp: '123456' });

    // Nothing goes to the SMS provider from the browser.
    const everyUrl = [...axiosMock.mock.calls, ...getMock.mock.calls].map(([a]) => (typeof a === 'string' ? a : a?.url || ''));
    expect(everyUrl.some((u) => /fast2sms/i.test(u))).toBe(false);
  });

  it('shows the server message when the code is wrong', async () => {
    await renderAt('/purchase');
    const phone = await screen.findByPlaceholderText(/primary phone/i, {}, { timeout: 5000 });
    fireEvent.change(phone, { target: { name: 'primary_phone', value: '9876543210' } });
    fireEvent.click(screen.getAllByRole('button', { name: /send otp/i })[0]);
    await waitFor(() => expect(axiosMock).toHaveBeenCalled());
    axiosMock.mockRejectedValueOnce({ response: { status: 400, data: { result: false, message: 'Invalid OTP' } } });
    fireEvent.change(await screen.findByPlaceholderText(/enter otp/i), { target: { name: 'otp', value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: /verify otp/i }));
    expect(await screen.findByText('Invalid OTP')).toBeInTheDocument();
  });
});
