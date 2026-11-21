import axios from 'axios';
import { BASE_URL } from '../components/common/CommonApiURL';

/**
 * Client for online mahal booking (API: MahalBookingController).
 * Every call resolves to { ok, message, data, status } and never throws, so screens can show the message.
 */

const token = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.token || '';
  } catch (e) {
    return '';
  }
};

const call = async (config) => {
  try {
    const res = await axios({ baseURL: BASE_URL, timeout: 20000, ...config });
    const body = res.data || {};
    return { ok: body.result !== false, message: body.message || '', data: body.data };
  } catch (err) {
    const body = err?.response?.data;
    const status = err?.response?.status;
    let message = body?.message;
    if (!message) {
      if (status === 429) message = 'Too many requests. Please wait a few minutes and try again.';
      else if (status === 401) message = 'Your session has ended. Please sign in again.';
      else if (status === 403) message = 'Only mahal admins can manage bookings.';
      else if (!err?.response) message = 'Could not reach the server. Check your connection and try again.';
      else message = 'Something went wrong. Please try again.';
    }
    return { ok: false, message, data: body?.data, status };
  }
};

const auth = () => ({ Authorization: `Bearer ${token()}` });
const R = 'MahalBooking/';

/** "2026-11-17" for a Date, in the visitor's local calendar (never shifted to UTC). */
export const toDay = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

/** "2026-11-17T18:30:00": local wall-clock time, the way the API stores booking times. */
export const toLocalIso = (d) => {
  const x = d instanceof Date ? d : new Date(d);
  return `${toDay(x)}T${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}:00`;
};

// ---- public site (no login)
export const searchMahals = (filters = {}) => call({ method: 'get', url: `${R}Public/Search`, params: filters });
export const getPublicMahal = (id) => call({ method: 'get', url: `${R}Public/Mahal`, params: { id } });
export const requestBooking = (form) => call({ method: 'post', url: `${R}Public/Request`, data: form });
export const getBookingStatus = (bookingRef, phone) => call({ method: 'get', url: `${R}Public/Status`, params: { bookingRef, phone } });

// ---- owner (mahal admin / super admin)
export const listMyMahals = () => call({ method: 'get', url: `${R}MyMahals`, headers: auth() });
export const saveMahal = (mahal) => call({ method: 'post', url: `${R}SaveMahal`, data: mahal, headers: auth() });
export const listBookings = (filters = {}) => call({ method: 'get', url: `${R}Bookings`, params: filters, headers: auth() });
export const getBooking = (id) => call({ method: 'get', url: `${R}Booking`, params: { id }, headers: auth() });
export const saveBooking = (booking) => call({ method: 'post', url: `${R}SaveBooking`, data: booking, headers: auth() });
export const setBookingStatus = (id, status, reason) => call({ method: 'post', url: `${R}SetStatus`, data: { id, status, reason }, headers: auth() });
export const recordPayment = (id, amount, payMethod) => call({ method: 'post', url: `${R}RecordPayment`, data: { id, amount, payMethod }, headers: auth() });
export const getMahalSummary = () => call({ method: 'get', url: `${R}Summary`, headers: auth() });

// ---- location dropdowns (login needed)
export const getStates = (countryId = 1) => call({ method: 'get', url: 'DropDown/GetStateDropDown', params: { countryId }, headers: auth() });
export const getDistricts = (stateId) => call({ method: 'get', url: 'DropDown/GetDistrictDropDown', params: { stateId }, headers: auth() });

// ---- hall photos
/** Address of a hall photo (public). thumb: the small copy for lists. */
export const photoUrl = (id, thumb = false) => `${BASE_URL}MahalBooking/Public/Photo/${id}${thumb ? '?size=thumb' : ''}`;
export const listPhotos = (mahalId) => call({ method: 'get', url: `${R}Photos`, params: { mahalId }, headers: auth() });
/** file / thumb: Blobs (already shrunk, see utils/resizeImage). */
export const uploadPhoto = (mahalId, file, thumb) => {
  const form = new FormData();
  form.append('mahalId', String(mahalId));
  form.append('file', file, 'photo.jpg');
  if (thumb) form.append('thumb', thumb, 'thumb.jpg');
  return call({ method: 'post', url: `${R}Photos/Upload`, data: form, headers: auth(), timeout: 60000 });
};
export const deletePhoto = (id) => call({ method: 'post', url: `${R}Photos/Delete`, params: { id }, headers: auth() });
export const setCoverPhoto = (id) => call({ method: 'post', url: `${R}Photos/Cover`, params: { id }, headers: auth() });
