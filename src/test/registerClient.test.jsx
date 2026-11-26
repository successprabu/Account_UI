/** Only super admins register clients (Moitech or mahal owners). */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const axiosMock = vi.fn();
const postMock = vi.fn();
vi.mock('axios', () => {
  const fn = (...args) => axiosMock(...args);
  const instance = Object.assign(fn, {
    get: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    post: (...args) => postMock(...args),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  });
  instance.create = () => instance;
  return { default: instance };
});

const token = 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp: 4102444800 })).replace(/=+$/, '') + '.';
const superAdmin = { id: 1, name: 'Owner', userType: 'SU', userTypeDescription: 'Super Admin', customerID: 1, functionId: 0, token };
const moitechAdmin = { id: 9, name: 'Kumar', userType: 'AU', userTypeDescription: 'Admin', customerID: 9, functionId: 3, token };

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Register client', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    axiosMock.mockResolvedValue({ data: { result: true, data: {} } });
    postMock.mockReset();
    localStorage.clear();
  });

  it('DigiMoi admin dashboard has no Add New Client link', async () => {
    localStorage.setItem('user', JSON.stringify(moitechAdmin));
    await renderAt('/dashboard');
    expect(await screen.findByRole('heading', { level: 1 }, { timeout: 5000 })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText(/add new client/i)).not.toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /register client/i })).not.toBeInTheDocument();
  });

  it('DigiMoi admin cannot open the register client screen', async () => {
    localStorage.setItem('user', JSON.stringify(moitechAdmin));
    await renderAt('/register-client');
    await waitFor(() => expect(window.location.pathname).toBe('/unauthorized'), { timeout: 5000 });
  });

  it('super admin registers a mahal owner as an independent account', async () => {
    localStorage.setItem('user', JSON.stringify(superAdmin));
    postMock.mockResolvedValue({ data: { result: true, message: 'Registration Completed Successfully', data: { id: 50 } } });
    await renderAt('/register-client?type=mahal');
    fireEvent.change(await screen.findByLabelText(/owner name/i, {}, { timeout: 5000 }), { target: { value: 'Lakshmi' } });
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button', { name: /register mahal owner/i }));

    expect(await screen.findByText(/lakshmi is registered/i)).toBeInTheDocument();
    const [url, body] = postMock.mock.calls[0];
    expect(url).toMatch(/Auth\/AddCustomer$/);
    expect(body).toMatchObject({ name: 'Lakshmi', primary_phone: '9876543210', userType: 'MU', customerId: 0, appName: 'MOI', createdBy: '1', isActive: true });
    expect(body.password).toHaveLength(8);
    expect(screen.getByRole('link', { name: /send on whatsapp/i }).getAttribute('href')).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/);
  });

  it('explains when the number already has an account', async () => {
    localStorage.setItem('user', JSON.stringify(superAdmin));
    postMock.mockResolvedValue({ data: { result: false, message: 'Already Mobile Number Exists With the same Combination' } });
    await renderAt('/register-client');
    fireEvent.change(await screen.findByLabelText(/client name/i, {}, { timeout: 5000 }), { target: { value: 'Ravi' } });
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: '9876543210' } });
    fireEvent.click(screen.getByRole('button', { name: /register moitech client/i }));
    expect(await screen.findByText(/already has a moitech account/i)).toBeInTheDocument();
    expect(postMock.mock.calls[0][1]).toMatchObject({ userType: 'AU', customerId: 0 });
  });
});
