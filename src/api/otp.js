import axios from 'axios';
import { BASE_URL } from '../components/common/CommonApiURL';

/**
 * Registration OTP through our API (Auth/SendOtp, Auth/VerifyOtp). The server makes the code, sends the SMS
 * and checks it, so no SMS key is in the website. Resolves to { ok, message } and never throws.
 */
const post = async (url, data, headers) => {
  try {
    const res = await axios({ baseURL: BASE_URL, timeout: 20000, method: 'post', url, data, headers });
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

/** Forgot password: send a code to the registered mobile, then reset with the code. */
export const forgotPassword = (phone) => post('Auth/ForgotPassword', { phone });
export const resetPassword = (phone, otp, newPassword) => post('Auth/ResetPassword', { phone, otp, newPassword });

/** Signed in: change the password (the current one is needed). */
export const changePassword = (currentPassword, newPassword) => {
  let token = '';
  try {
    token = JSON.parse(localStorage.getItem('user'))?.token || '';
  } catch (e) {
    token = '';
  }
  return post('Auth/ChangePassword', { currentPassword, newPassword }, { Authorization: `Bearer ${token}` });
};
