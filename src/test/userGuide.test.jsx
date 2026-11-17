/** User guides: the list of guides, one product's guide from its JSON file, and the guide link in the menu. */
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

vi.mock('axios', () => {
  const instance = Object.assign(vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })), {
    get: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    post: vi.fn(() => Promise.resolve({ data: { result: true, data: [] } })),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } },
  });
  instance.create = () => instance;
  return { default: instance };
});

const guideFile = (id) => JSON.parse(readFileSync(resolve(__dirname, `../../public/guide/${id}.json`), 'utf8'));

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

const serveGuides = () => {
  // jsdom has no IntersectionObserver (the scroll animations use it).
  vi.stubGlobal('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } });
  return vi.stubGlobal('fetch', vi.fn((url) => {
    const m = String(url).match(/\/guide\/(\w+)\.json$/);
    return Promise.resolve(m ? { ok: true, json: () => Promise.resolve(guideFile(m[1])) } : { ok: false, json: () => Promise.resolve({}) });
  }));
};

describe('User guides', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('every guide file is complete and points at pictures that exist', () => {
    for (const id of ['moitech', 'mahal', 'school']) {
      const g = guideFile(id);
      expect(g.id).toBe(id);
      expect(g.sections.length).toBeGreaterThan(2);
      for (const s of g.sections) {
        for (const st of s.steps) {
          expect(st.title && st.text).toBeTruthy();
          if (st.img) expect(() => readFileSync(resolve(__dirname, `../../public/guide/${id}/${st.img}`))).not.toThrow();
        }
      }
    }
  });

  it('lists the three guides with a PDF for each', async () => {
    serveGuides();
    await renderAt('/user-guide');
    expect(await screen.findByRole('heading', { name: 'User guides' }, { timeout: 5000 })).toBeInTheDocument();
    for (const id of ['moitech', 'mahal', 'school']) {
      expect(screen.getAllByRole('link', { name: /download pdf/i }).some((a) => a.getAttribute('href') === `/guide/${id}.pdf`)).toBe(true);
    }
  });

  it("shows a product's numbered steps and enlarges a screenshot", async () => {
    serveGuides();
    await renderAt('/user-guide/mahal');
    expect(await screen.findByRole('heading', { name: 'Mahal Management user guide' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Answer a booking request' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute('href', '/guide/mahal.pdf');
    fireEvent.click(screen.getByRole('button', { name: 'Enlarge screenshot: Confirm or decline' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('says so for an unknown guide', async () => {
    serveGuides();
    await renderAt('/user-guide/nothing');
    expect(await screen.findByText(/no guide at this address/i, {}, { timeout: 5000 })).toBeInTheDocument();
  });
});
