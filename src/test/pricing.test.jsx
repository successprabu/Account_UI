/** Each product has its own demo and pricing; payments use the signed-in account. */
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

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Demo and pricing per product', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    axiosMock.mockResolvedValue({ data: { result: true, data: [] } });
    postMock.mockReset();
    localStorage.clear();
  });

  it('Try Demo lets the visitor pick DigiMoi, Mahal or School ERP', async () => {
    await renderAt('/services');
    const buttons = await screen.findAllByRole('button', { name: /try demo/i }, { timeout: 5000 });
    fireEvent.click(buttons[0]);
    expect(await screen.findByRole('menuitem', { name: /digimoi/i })).toHaveAttribute('href', '/purchase');
    expect(screen.getByRole('menuitem', { name: /mahal management/i })).toHaveAttribute('href', '/mahal-reg');
    const school = screen.getByRole('menuitem', { name: /school website/i });
    expect(school.tagName).toBe('A');
    expect(school.getAttribute('href')).toMatch(/myschool/);
    expect(school).toHaveAttribute('target', '_blank');
    // Custom Software has no demo; it starts with a conversation.
    expect(screen.queryByRole('menuitem', { name: /custom software/i })).not.toBeInTheDocument();
  });

  it('custom software asks the visitor to share their requirement', async () => {
    await renderAt('/services');
    expect(await screen.findByRole('heading', { name: 'Custom Software' }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tell us your requirement/i })).toHaveAttribute('href', '/contactus?topic=Custom%20Software');
  });

  it('mahal pricing shows 1 month free, ₹4,999 a month and ₹49,999 a year', async () => {
    await renderAt('/pricing?product=mahal');
    expect(await screen.findByText('₹4,999', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('₹49,999')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start 1 month free/i })).toBeInTheDocument();
    expect(screen.queryByText('₹99')).not.toBeInTheDocument();
  });

  it('moitech pricing is unchanged', async () => {
    await renderAt('/pricing');
    expect(await screen.findByText('₹99', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText('₹199')).toBeInTheDocument();
  });

  it('asks a visitor to sign in before paying', async () => {
    await renderAt('/pricing?product=mahal');
    fireEvent.click(await screen.findByRole('button', { name: /choose monthly/i }, { timeout: 5000 }));
    expect(await screen.findByRole('button', { name: /sign in/i }, { timeout: 5000 })).toBeInTheDocument();
    expect(postMock).not.toHaveBeenCalled();
  });

  it('creates the order in rupees for the signed-in account', async () => {
    localStorage.setItem('user', JSON.stringify({ id: 4, name: 'Ravi', primary_phone: '9876500000', userType: 'MU', token: 't' }));
    window.Razorpay = vi.fn(() => ({ open: vi.fn() }));
    postMock.mockResolvedValue({ data: { result: true, data: { orderId: 'order_1', amount: '499900' } } });
    await renderAt('/pricing?product=mahal');
    fireEvent.click(await screen.findByRole('button', { name: /choose monthly/i }, { timeout: 5000 }));
    await waitFor(() => expect(postMock).toHaveBeenCalled());
    expect(postMock.mock.calls[0][1]).toMatchObject({ amount: 4999, plan: 'mahal-monthly', billingCycle: 'monthly', customerPhone: '9876500000' });
    await waitFor(() => expect(window.Razorpay).toHaveBeenCalled());
    expect(window.Razorpay.mock.calls[0][0]).toMatchObject({ amount: '499900', prefill: { contact: '9876500000' } });
  });

  it('footer products explain how to start and link to the right registration', async () => {
    await renderAt('/about');
    const footer = await screen.findByRole('contentinfo', {}, { timeout: 5000 });
    const { within } = await import('@testing-library/react');
    fireEvent.click(within(footer).getByRole('button', { name: /^digimoi$/i }));
    expect(await screen.findByRole('heading', { name: /want to try digimoi/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register for free/i })).toHaveAttribute('href', '/purchase');
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('heading', { name: /want to try digimoi/i })).not.toBeInTheDocument());

    fireEvent.click(await within(footer).findByRole('button', { name: /^mahal management$/i }));
    expect(await screen.findByRole('link', { name: /register your mahal/i })).toHaveAttribute('href', '/mahal-reg');
    expect(screen.getByRole('link', { name: /already registered\? sign in/i })).toHaveAttribute('href', '/login');
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() => expect(screen.queryByRole('link', { name: /register your mahal/i })).not.toBeInTheDocument());

    // School ERP still opens its demo site directly.
    expect((await within(footer).findByRole('link', { name: /school website/i })).getAttribute('href')).toMatch(/myschool/);
  });
});
