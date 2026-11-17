/** Online mahal booking: public search and request, owner approves a request. */
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

const mahalAdmin = {
  id: 3,
  name: 'Owner',
  userType: 'MU',
  userTypeDescription: 'Mahal Admin',
  token: 'eyJhbGciOiJub25lIn0.' + btoa(JSON.stringify({ exp: 4102444800 })).replace(/=+$/, '') + '.',
};

const day = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const hall = {
  id: 5,
  mahalName: 'Sri Lakshmi Mahal',
  description: 'Big hall near the temple.',
  capacity: 800,
  pricePerDay: 50000,
  advanceAmount: 10000,
  amenities: ['Parking', 'Dining hall'],
  eventTypes: ['Marriage', 'Birthday'],
  districtName: 'Madurai',
  stateName: 'Tamil Nadu',
  district: 12,
  addressLine1: '12 Temple Road',
  pincode: 625001,
  availableOnDate: null,
};

const ok = (data, message = '') => Promise.resolve({ data: { result: true, message, data } });

const renderAt = async (path) => {
  window.history.pushState({}, '', path);
  const { default: App } = await import('../App');
  return render(<App />);
};

describe('Mahal booking', () => {
  beforeEach(() => {
    axiosMock.mockReset();
    localStorage.clear();
  });

  it('public search lists halls that take online bookings', async () => {
    axiosMock.mockImplementation(({ url }) => (url === 'MahalBooking/Public/Search' ? ok([hall]) : ok([])));
    await renderAt('/mahals');
    expect(await screen.findByText('Sri Lakshmi Mahal', {}, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByText(/up to 800 guests/i)).toBeInTheDocument();
    expect(screen.getByText('₹50,000')).toBeInTheDocument();
  });

  it('visitor sends a booking request for a free date and gets a reference', async () => {
    const date = day(10);
    axiosMock.mockImplementation(({ url }) => {
      if (url === 'MahalBooking/Public/Mahal') return ok({ mahal: hall, contactNumber: '9876500000', bookedDates: [day(11)], requestedDates: [] });
      if (url === 'MahalBooking/Public/Request') return ok({ bookingRef: 'MBTEST42', status: 'Pending', totalAmount: 50000 }, 'Thank you.');
      return ok([]);
    });
    await renderAt(`/mahals/5?date=${date}`);
    expect(await screen.findByRole('heading', { name: 'Sri Lakshmi Mahal' }, { timeout: 5000 })).toBeInTheDocument();
    // The chosen date shows the estimate from the daily rent.
    expect(screen.getByText(/estimated rent/i)).toHaveTextContent('₹50,000');

    fireEvent.click(screen.getByRole('button', { name: 'Marriage' }));
    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Karthik' } });
    fireEvent.change(screen.getByLabelText(/^phone/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByLabelText(/^guests/i), { target: { value: '500' } });
    fireEvent.click(screen.getByRole('button', { name: /send booking request/i }));

    expect(await screen.findByText('MBTEST42')).toBeInTheDocument();
    const call = axiosMock.mock.calls.find(([cfg]) => cfg.url === 'MahalBooking/Public/Request')[0];
    expect(call.method).toBe('post');
    expect(call.data).toMatchObject({ mahalId: 5, name: 'Karthik', phone: '9876543210', eventType: 'Marriage', guestCount: 500, fromDate: date, toDate: date, website: '' });
  });

  it('does not send a request without a name, phone and event', async () => {
    axiosMock.mockImplementation(({ url }) =>
      url === 'MahalBooking/Public/Mahal' ? ok({ mahal: hall, bookedDates: [], requestedDates: [] }) : ok([])
    );
    await renderAt(`/mahals/5?date=${day(5)}`);
    fireEvent.click(await screen.findByRole('button', { name: /send booking request/i }, { timeout: 5000 }));
    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/choose the event/i)).toBeInTheDocument();
    expect(axiosMock.mock.calls.some(([cfg]) => cfg.url === 'MahalBooking/Public/Request')).toBe(false);
  });

  it('mahal admin confirms an online request from the bookings screen', async () => {
    localStorage.setItem('user', JSON.stringify(mahalAdmin));
    const request = {
      id: 21, mahalId: 5, mahalName: 'Sri Lakshmi Mahal', bookingRef: 'MBTEST42', customerName: 'Karthik', primary_phone: '9876543210',
      eventType: 'Marriage', guestCount: 500, fromDate: `${day(10)}T00:00:00`, toDate: `${day(11)}T00:00:00`, status: 'Pending', source: 'online',
      totalAmount: 50000, discount: 0, advance: 0, rcdAmount: 0, balance: 50000, createdDt: `${day(0)}T09:00:00`,
    };
    let current = request;
    axiosMock.mockImplementation(({ url, data }) => {
      if (url === 'MahalBooking/MyMahals') return ok([{ ...hall, isOnlineBooking: true, isActive: true }]);
      if (url === 'MahalBooking/Bookings') return ok({ items: [request], total: 1, counts: { Pending: 1, Upcoming: 4, Completed: 2, Cancelled: 0, All: 7 } });
      if (url === 'MahalBooking/Booking') return ok(current);
      if (url === 'MahalBooking/SetStatus') {
        current = { ...current, status: data.status };
        return ok(current, 'Booking confirmed.');
      }
      return ok([]);
    });
    await renderAt('/mahal-bookings?tab=Pending');
    fireEvent.click(await screen.findByRole('button', { name: /booking for karthik/i }, { timeout: 5000 }));
    const drawer = await screen.findByRole('presentation');
    fireEvent.click(await within(drawer).findByRole('button', { name: /^confirm$/i }));

    await waitFor(() => {
      const call = axiosMock.mock.calls.find(([cfg]) => cfg.url === 'MahalBooking/SetStatus');
      expect(call?.[0].data).toMatchObject({ id: 21, status: 'Confirmed' });
    });
    expect(await within(drawer).findByText('Confirmed')).toBeInTheDocument();
  });
});
