import axios from 'axios';
import { BASE_URL } from '../components/common/CommonApiURL';

/**
 * Registration OTP through our API (Auth/SendOtp, Auth/VerifyOtp). The server makes the code, sends the SMS
 * and checks it, so no SMS key is in the website. Resolves to { ok, message } and never throws.
 */
const post = async (url, data) => {
  try {
    const res = await axios({ baseURL: BASE_URL, timeout: 20000, method: 'post', url, data });
    const body = res.data || {};
    return { ok: body.result !== false, message: body.message || '' };
  } catch (err) {
    const status = err?.response?.status;
    let message = err?.response?.data?.message;
    if (!message) {
      if (status === 429) message = 'Too many tries. Please wait a few minutes and try again.';
      else if (!err?.response) message = 'Could not reach the server. Check your connection and try again.';
      else message = 'Something went wrong. Please try again.';
    }
    return { ok: false, message };
  }
};

export const sendOtp = (phone, userType = 'AU') => post('Auth/SendOtp', { phone, userType, appName: 'MOI' });
export const verifyOtp = (phone, otp) => post('Auth/VerifyOtp', { phone, otp });
