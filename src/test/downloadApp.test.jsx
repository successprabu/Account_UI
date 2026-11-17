/** The download page serves the APK from the website, or from GitHub when the site has none yet. */
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('axios', () => {
  const instance = Object.assign(vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })), {
    get: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
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

describe('Download app page', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('links to the APK on the website when it is there', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, headers: new Headers({ 'content-type': 'application/vnd.android.package-archive' }) })));
    await renderAt('/download-app');
    const link = await screen.findByRole('link', { name: /download for android/i }, { timeout: 5000 });
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(link).toHaveAttribute('href', '/downloads/MySuccess.apk');
  });

  it('falls back to the GitHub release when the site returns the web page instead', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, headers: new Headers({ 'content-type': 'text/html' }) })));
    await renderAt('/download-app');
    const link = await screen.findByRole('link', { name: /download for android/i }, { timeout: 5000 });
    await waitFor(() => expect(link.getAttribute('href')).toMatch(/github\.com\/successprabu\/AIMobileApp\/releases\/latest\/download\/MySuccess\.apk$/));
  });
});
