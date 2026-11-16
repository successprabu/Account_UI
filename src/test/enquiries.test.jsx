/** Enquiries: the contact form saves through the API; super admins see the inbox. */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

const superAdmin = {
  id: 1,
  name: 'Owner',
  userType: 'SU',
  userTypeDescription: 'Super Admin',
  token: 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp: 4102444800 })).replace(/=+$/, '') + '.',
};

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Enquiries', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
  });

  it('contact form sends the message to api/Enquiry/Submit and thanks the visitor', async () => {
    axiosMock.mockResolvedValue({ data: { result: true, message: 'Thank you. We will reply within one working day.', data: { id: 1 } } });
    await renderAt('/contactus');

    fireEvent.change(await screen.findByLabelText(/your name/i), { target: { value: 'Lakshmi' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'Please call me about School ERP.' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/we will reply within one working day/i)).toBeInTheDocument();
    const call = axiosMock.mock.calls.find(([cfg]) => cfg.url === 'Enquiry/Submit')[0];
    expect(call.method).toBe('post');
    expect(call.data).toMatchObject({ name: 'Lakshmi', phone: '9876543210', message: 'Please call me about School ERP.', website: '' });
  });

  it('shows the server message when saving fails', async () => {
    axiosMock.mockRejectedValue({ response: { status: 429, data: { result: false, message: 'Too many messages.' } } });
    await renderAt('/contactus');
    fireEvent.change(await screen.findByLabelText(/your name/i), { target: { value: 'Ravi' } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: 'ravi@example.com' } });
    fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'Hello there' } });
    fireEvent.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByText(/too many messages/i)).toBeInTheDocument();
  });

  it('super admin inbox lists new enquiries with counts', async () => {
    localStorage.setItem('user', JSON.stringify(superAdmin));
    axiosMock.mockImplementation(({ url }) =>
      url === 'Enquiry/List'
        ? Promise.resolve({
            data: {
              result: true,
              data: {
                items: [{ id: 7, name: 'Meena', phone: '9000000001', email: null, topic: 'AI and automation', preview: 'Need a quote', status: 'New', createdDt: '2026-11-16T10:00:00' }],
                total: 1,
                counts: { New: 1, Replied: 3, Closed: 2 },
              },
            },
          })
        : Promise.resolve({ data: { result: true, data: [] } })
    );
    await renderAt('/enquiries');
    expect(await screen.findByRole('heading', { name: /^enquiries$/i })).toBeInTheDocument();
    expect(await screen.findByText('Meena')).toBeInTheDocument();
    expect(screen.getByText('Need a quote')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('tab', { name: /all\s*6/i })).toBeInTheDocument());
  });
});
