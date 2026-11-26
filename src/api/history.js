import axios from 'axios';
import { BASE_URL } from '../components/common/CommonApiURL';

/**
 * Moitech history (API: Transaction/History). Read only: there is no call that changes or deletes history.
 * Resolves to { ok, message, data, status } and never throws.
 */
const token = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.token || '';
  } catch (e) {
    return '';
  }
};

export const listHistory = async (filters = {}) => {
  try {
    const res = await axios({ baseURL: BASE_URL, timeout: 20000, method: 'get', url: 'Transaction/History', params: filters, headers: { Authorization: `Bearer ${token()}` } });
    const body = res.data || {};
    return { ok: body.result !== false, message: body.message || '', data: body.data };
  } catch (err) {
    const status = err?.response?.status;
    let message = err?.response?.data?.message;
    if (!message) {
      if (status === 401) message = 'Your session has ended. Please sign in again.';
      else if (status === 403) message = 'Only the DigiMoi admin can see the history.';
      else if (!err?.response) message = 'Could not reach the server. Check your connection and try again.';
      else message = 'Something went wrong. Please try again.';
    }
    return { ok: false, message, status };
  }
};
