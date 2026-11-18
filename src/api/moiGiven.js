import axios from 'axios';
import { BASE_URL } from '../components/common/CommonApiURL';

/**
 * "Moi we gave" (API: MoiGiven/*): moi the admin gave at other people's functions, and the give & take
 * comparison with what they gave at our functions. Resolves to { ok, message, data, status }; never throws.
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
    const res = await axios({ baseURL: BASE_URL, timeout: 20000, headers: { Authorization: `Bearer ${token()}` }, ...config });
    const body = res.data || {};
    return { ok: body.result !== false, message: body.message || '', data: body.data };
  } catch (err) {
    const status = err?.response?.status;
    let message = err?.response?.data?.message;
    if (!message) {
      if (status === 401) message = 'Your session has ended. Please sign in again.';
      else if (status === 403) message = 'Only the Moitech admin can use this.';
      else if (!err?.response) message = 'Could not reach the server. Check your connection and try again.';
      else message = 'Something went wrong. Please try again.';
    }
    return { ok: false, message, status };
  }
};

export const listGiven = (params = {}) => call({ method: 'get', url: 'MoiGiven/List', params });
export const saveGiven = (entry) => call({ method: 'post', url: 'MoiGiven/Save', data: entry });
export const deleteGiven = (id) => call({ method: 'post', url: 'MoiGiven/Delete', params: { id } });
export const linkGiven = (givenId, transactionId) => call({ method: 'post', url: 'MoiGiven/Link', data: { givenId, transactionId } });
export const compareGiven = (params = {}) => call({ method: 'get', url: 'MoiGiven/Compare', params });
