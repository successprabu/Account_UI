/**
 * Smoke tests: the key screens mount and show their main controls.
 * The API is mocked, so these run in CI without a backend.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const ok = (data = []) => Promise.resolve({ data: { result: true, data, message: '' } });

vi.mock('axios', () => {
  const instance = {
    get: vi.fn(() => ok()),
    post: vi.fn(() => ok()),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  };
  const axios = { ...instance, create: () => instance };
  return { default: axios, ...axios };
});

const demoUser = (userType = 'AU') => ({
  id: 1,
  name: 'Test Admin',
  userType,
  userTypeDescription: 'Admin',
  customerID: 7,
  functionId: 3,
  // unsigned token with an expiry far in the future; only decoded, never verified in the UI
  token: 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp: 4102444800, sub: '1' })).replace(/=+$/, '') + '.',
});

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('MySuccess UI smoke tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('home page shows the headline and demo button', async () => {
    await renderAt('/');
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/business digital/i);
    expect(screen.getAllByRole('link', { name: /try demo/i }).length).toBeGreaterThan(0);
  });

  it('login page shows mobile number, password and sign in', async () => {
    await renderAt('/login');
    expect(await screen.findByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('dashboard renders the app shell and summary cards for an admin', async () => {
    localStorage.setItem('user', JSON.stringify(demoUser('AU')));
    await renderAt('/dashboard');
    expect(await screen.findByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(await screen.findByText(/total rcd\. amount/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /app/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /account menu/i })).toBeInTheDocument();
  });

  it('new receipt screen opens for an admin', async () => {
    localStorage.setItem('user', JSON.stringify(demoUser('AU')));
    await renderAt('/transaction');
    expect(await screen.findByRole('heading', { name: /new receipt/i }, { timeout: 8000 })).toBeInTheDocument();
  });

  it('unknown route shows the not-found page', async () => {
    await renderAt('/this-page-does-not-exist');
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument();
  });
});
