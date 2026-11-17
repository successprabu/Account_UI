/** The download page serves the APK from the website, or from GitHub when the site has none yet. */
import { render, screen } from '@testing-library/react';
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

const asAndroid = () => vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile');

describe('Download app page', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('on a phone, downloads the single APK from GitHub (served as an Android app) and shows its size', async () => {
    asAndroid();
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ assets: [{ name: 'MySuccess.apk', size: 14.5 * 1048576 }] }) })));
    await renderAt('/download-app');
    const link = await screen.findByRole('link', { name: /download for android \(14\.5 mb\)/i }, { timeout: 5000 });
    expect(link.getAttribute('href')).toMatch(/github\.com\/successprabu\/AIMobileApp\/releases\/latest\/download\/MySuccess\.apk$/);
    expect(link).toHaveAttribute('download', 'MySuccess.apk');
  });

  it('on a computer, offers to send the link to the phone and explains the APK file', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('offline'))));
    await renderAt('/download-app');
    expect(await screen.findByRole('link', { name: /send the link to my phone/i }, { timeout: 5000 })).toHaveAttribute('href', expect.stringMatching(/^https:\/\/wa\.me\//));
    expect(screen.getAllByRole('alert').some((a) => /installs on android phones/i.test(a.textContent))).toBe(true);
    expect(screen.getByRole('link', { name: /download mysuccess\.apk/i }).getAttribute('href')).toMatch(/MySuccess\.apk$/);
  });
});
