/** An expired login signs out and goes to the login page (not "session ended" on the dashboard). */
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios', () => {
  const instance = Object.assign(vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })), {
    get: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    post: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  });
  instance.create = () => instance;
  return { default: instance };
});

const token = (exp) => 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp })).replace(/=+$/, '') + '.';
const owner = { id: 2, name: 'Antony', userType: 'MU', userTypeDescription: 'Mahal Admin', customerID: 2 };

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Session', () => {
  beforeEach(() => localStorage.clear());

  it('an expired login on a page goes to the login page with a short note', async () => {
    localStorage.setItem('user', JSON.stringify({ ...owner, token: token(1000) }));
    await renderAt('/dashboard');
    await waitFor(() => expect(window.location.pathname).toBe('/login'), { timeout: 5000 });
    expect(window.location.search).toBe('?session=expired');
    expect(localStorage.getItem('user')).toBeNull();
    expect(await screen.findByText('Your session has ended. Please sign in again.')).toBeInTheDocument();
    expect(screen.queryByRole('alert', { name: /error/i })).not.toBeInTheDocument();
  });

  it('when the API answers 401 to a signed-in call, sign out and go to the login page', async () => {
    const replace = vi.fn();
    const realLocation = window.location;
    Object.defineProperty(window, 'location', { configurable: true, value: { ...realLocation, pathname: '/dashboard', replace } });
    let onError;
    vi.resetModules(); // a fresh copy: the app already installed its own watch once
    const { watchSession } = await import('../utils/session');
    watchSession({ interceptors: { response: { use: (_ok, bad) => { onError = bad; } } } });
    localStorage.setItem('user', JSON.stringify({ ...owner, token: token(4102444800) }));

    // A public call (no login sent) that fails is left alone.
    await expect(onError({ config: { headers: {} }, response: { status: 401 } })).rejects.toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
    // Any other error is left alone too.
    await expect(onError({ config: { headers: { Authorization: 'Bearer abc' } }, response: { status: 400 } })).rejects.toBeTruthy();
    expect(replace).not.toHaveBeenCalled();

    await expect(onError({ config: { headers: { Authorization: 'Bearer abc' } }, response: { status: 401 } })).rejects.toBeTruthy();
    expect(localStorage.getItem('user')).toBeNull();
    expect(replace).toHaveBeenCalledWith('/login?session=expired');
    Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
  });

  it('a 401 is retried once with a renewed token when there is a refresh token', async () => {
    vi.resetModules();
    const { watchSession } = await import('../utils/session');
    let onError;
    const client = vi.fn(() => Promise.resolve({ data: 'again' }));
    client.interceptors = { response: { use: (_ok, bad) => { onError = bad; } } };
    watchSession(client);
    localStorage.setItem('user', JSON.stringify({ ...owner, token: token(4102444800), refreshToken: 'r1', refreshExpires: '2099-01-01T00:00:00Z' }));
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ result: true, data: { token: 'new.t.k', refreshToken: 'r2', refreshExpires: '2099-02-01T00:00:00Z' } }) }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await onError({ config: { headers: { Authorization: 'Bearer old' } }, response: { status: 401 } });
    expect(res).toEqual({ data: 'again' });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ refreshToken: 'r1' });
    expect(client.mock.calls[0][0].headers.Authorization).toBe('Bearer new.t.k');
    const saved = JSON.parse(localStorage.getItem('user'));
    expect(saved.refreshToken).toBe('r2');
    expect(saved.name).toBe('Antony');
    vi.unstubAllGlobals();
  });
});
