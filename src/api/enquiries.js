import axios from 'axios';
import { BASE_URL } from '../components/common/CommonApiURL';

/**
 * Client for the website-enquiry endpoints (API: EnquiryController).
 * Every call resolves to { ok, message, data } and never throws, so screens can show the message.
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
      if (status === 429) message = 'Too many messages. Please wait a few minutes and try again.';
      else if (status === 401) message = 'Your session has ended. Please sign in again.';
      else if (status === 403) message = 'Only super admins can see enquiries.';
      else if (!err?.response) message = 'Could not reach the server. Check your connection and try again.';
      else message = 'Something went wrong. Please try again.';
    }
    return { ok: false, message, data: body?.data, status };
  }
};

const auth = () => ({ Authorization: `Bearer ${token()}` });

/** Public: send a message from the contact form. `website` is the hidden anti-spam field. */
export const submitEnquiry = (form) =>
  call({
    method: 'post',
    url: 'Enquiry/Submit',
    data: {
      name: form.name,
      phone: form.phone || null,
      email: form.email || null,
      topic: form.topic,
      message: form.message,
      website: form.website || '',
    },
  });

export const listEnquiries = ({ status, search, page = 1, pageSize = 20 } = {}) =>
  call({ method: 'get', url: 'Enquiry/List', params: { status: status || undefined, search: search || undefined, page, pageSize }, headers: auth() });

export const getEnquiry = (id) => call({ method: 'get', url: 'Enquiry/Get', params: { id }, headers: auth() });

export const replyToEnquiry = (enquiryId, message, channel) =>
  call({ method: 'post', url: 'Enquiry/Reply', data: { enquiryId, message, channel }, headers: auth() });

export const setEnquiryStatus = (enquiryId, status) =>
  call({ method: 'post', url: 'Enquiry/UpdateStatus', data: { enquiryId, status }, headers: auth() });
