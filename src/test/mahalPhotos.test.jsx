/** Hall photos: the owner adds, orders and removes them; customers see them on the hall page. */
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
// jsdom has no canvas: shrinking is tested in the browser; here it just passes small blobs on.
vi.mock('../utils/resizeImage', () => ({
  resizeImage: vi.fn(async () => ({ full: new Blob(['full'], { type: 'image/jpeg' }), thumb: new Blob(['thumb'], { type: 'image/jpeg' }) })),
}));
URL.createObjectURL = vi.fn(() => 'blob:preview');
URL.revokeObjectURL = vi.fn();

const token = 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp: 4102444800 })).replace(/=+$/, '') + '.';
const owner = { id: 2, name: 'Ravi', userType: 'MU', userTypeDescription: 'Mahal Admin', customerID: 2, token };
const hall = { id: 1, mahalName: 'Ravi Hall', addressLine1: 'Madurai', state: 1, district: 1, pincode: 625001, capacity: 800, pricePerDay: 75000, isOnlineBooking: true, isActive: true, eventTypes: ['Marriage'], amenities: [], photos: [15, 14], coverPhotoId: 15, pendingRequests: 0, upcomingEvents: 0 };

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};
const calls = (url) => axiosMock.mock.calls.filter(([c]) => c?.url === url).map(([c]) => c);

describe('Hall photos', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
    axiosMock.mockImplementation((c) => {
      if (c.url === 'MahalBooking/MyMahals') return Promise.resolve({ data: { result: true, data: [hall] } });
      if (c.url === 'MahalBooking/Public/Mahal') return Promise.resolve({ data: { result: true, data: { mahal: hall, bookedDates: [], requestedDates: [] } } });
      if (c.url === 'MahalBooking/Photos/Upload') return Promise.resolve({ data: { result: true, message: 'Photo added.', data: [{ id: 15 }, { id: 14 }, { id: 16 }] } });
      if (c.url === 'MahalBooking/Photos/Cover') return Promise.resolve({ data: { result: true, data: [{ id: 14 }, { id: 15 }] } });
      if (c.url === 'MahalBooking/Photos/Delete') return Promise.resolve({ data: { result: true, data: [{ id: 15 }] } });
      return Promise.resolve({ data: { result: true, data: [] } });
    });
  });

  it('customers see the cover first, can move through the photos and open them large', async () => {
    await renderAt('/mahals/1');
    const main = await screen.findByAltText('Ravi Hall: photo 1 of 2', {}, { timeout: 5000 });
    expect(main.getAttribute('src')).toMatch(/MahalBooking\/Public\/Photo\/15$/);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Next photo' })[0]);
    expect(await screen.findByText('2 / 2')).toBeInTheDocument();
    fireEvent.click(screen.getByAltText('Ravi Hall: photo 2 of 2'));
    expect(await screen.findByRole('dialog', { name: 'Ravi Hall photos' })).toBeInTheDocument();
  });

  it('the owner adds a photo (sent with a small copy), changes the cover and removes one', async () => {
    localStorage.setItem('user', JSON.stringify(owner));
    await renderAt('/my-mahals');
    fireEvent.click(await screen.findByRole('button', { name: /edit/i }, { timeout: 5000 }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/2 of 12 photos/)).toBeInTheDocument();

    fireEvent.change(within(dialog).getByTestId('photo-input'), { target: { files: [new File(['x'], 'hall.jpg', { type: 'image/jpeg' })] } });
    await waitFor(() => expect(calls('MahalBooking/Photos/Upload')).toHaveLength(1));
    const form = calls('MahalBooking/Photos/Upload')[0].data;
    expect(form.get('mahalId')).toBe('1');
    expect(form.get('file')).toBeInstanceOf(Blob);
    expect(form.get('thumb')).toBeInstanceOf(Blob);
    expect(await within(dialog).findByText(/3 of 12 photos/)).toBeInTheDocument();

    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Make this the cover photo' })[0]);
    await waitFor(() => expect(calls('MahalBooking/Photos/Cover')[0].params).toEqual({ id: 14 }));

    fireEvent.click(within(dialog).getAllByRole('button', { name: 'Remove this photo' })[1]);
    await waitFor(() => expect(calls('MahalBooking/Photos/Delete')).toHaveLength(1));
    expect(await within(dialog).findByText(/1 of 12 photos/)).toBeInTheDocument();
  });

  it('cards show the cover photo (small copy) and how many photos there are', async () => {
    localStorage.setItem('user', JSON.stringify(owner));
    await renderAt('/my-mahals');
    const img = await screen.findByAltText('Ravi Hall', {}, { timeout: 5000 });
    expect(img.getAttribute('src')).toMatch(/Public\/Photo\/15\?size=thumb$/);
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});
