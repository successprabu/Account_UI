/** Opening Help (Contact) or other public pages while signed in keeps you signed in, with a way back. */
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios', () => {
  const instance = Object.assign(vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })), {
    get: vi.fn(() => Promise.resolve({ data: { result: true, data: {} } })),
    post: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  });
  instance.create = () => instance;
  return { default: instance };
});

const token = (exp) => 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp })).replace(/=+$/, '') + '.';
const admin = { id: 9, name: 'Kumar', primary_phone: '9876500000', userType: 'AU', userTypeDescription: 'Admin', customerID: 9, functionId: 3, token: token(4102444800) };

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Public pages while signed in', () => {
  beforeEach(() => localStorage.clear());

  it('Help (contact page) shows "My dashboard", not Login, and fills in your details', async () => {
    localStorage.setItem('user', JSON.stringify(admin));
    await renderAt('/contactus');
    const back = await screen.findAllByRole('link', { name: /my dashboard/i }, { timeout: 5000 });
    expect(back[0]).toHaveAttribute('href', '/dashboard');
    expect(screen.queryByRole('link', { name: /^login$/i })).not.toBeInTheDocument();
    expect(screen.getByDisplayValue('Kumar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9876500000')).toBeInTheDocument();
    expect(localStorage.getItem('user')).not.toBeNull();
  });

  it('the login page sends a signed-in user to the dashboard', async () => {
    localStorage.setItem('user', JSON.stringify(admin));
    await renderAt('/login');
    await waitFor(() => expect(window.location.pathname).toBe('/dashboard'), { timeout: 5000 });
  });

  it('visitors and expired logins still see Login', async () => {
    localStorage.setItem('user', JSON.stringify({ ...admin, token: token(1000) }));
    await renderAt('/contactus');
    expect((await screen.findAllByRole('link', { name: /^login$/i }, { timeout: 5000 })).length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: /my dashboard/i })).not.toBeInTheDocument();
  });
});
