import { auth, call } from './mahal';

/** Client for running a hall (API: MahalOpsController): expenses, profit, billing, invoices, reminders, staff, online pay. */
const R = 'MahalOps/';

// ---- expenses and profit
export const listExpenses = (filters = {}) => call({ method: 'get', url: `${R}Expenses`, params: filters, headers: auth() });
export const saveExpense = (expense) => call({ method: 'post', url: `${R}SaveExpense`, data: expense, headers: auth() });
export const deleteExpense = (id) => call({ method: 'post', url: `${R}DeleteExpense`, params: { id }, headers: auth() });
/** month: "2026-11". Owner only. */
export const getProfit = (month, mahalId) => call({ method: 'get', url: `${R}Profit`, params: { month, mahalId: mahalId || undefined }, headers: auth() });

// ---- billing, invoices, reminders
export const saveBilling = (settings) => call({ method: 'post', url: `${R}SaveBilling`, data: settings, headers: auth() });
export const getInvoice = (bookingId) => call({ method: 'get', url: `${R}Invoice`, params: { bookingId }, headers: auth() });
export const listReminders = () => call({ method: 'get', url: `${R}Reminders`, headers: auth() });
export const markReminder = (bookingId, kind) => call({ method: 'post', url: `${R}Reminders/Mark`, data: { bookingId, kind }, headers: auth() });

// ---- staff logins (owner only)
export const listStaff = () => call({ method: 'get', url: `${R}Staff`, headers: auth() });
export const saveStaff = (staff) => call({ method: 'post', url: `${R}SaveStaff`, data: staff, headers: auth() });

// ---- public: pay the advance online (hall's own Razorpay account)
export const createPayOrder = (bookingRef, phone) => call({ method: 'post', url: `${R}Public/PayOrder`, data: { bookingRef, phone } });
export const verifyPay = (data) => call({ method: 'post', url: `${R}Public/PayVerify`, data });

/** Loads Razorpay Checkout once. Resolves to window.Razorpay, or null if it cannot load. */
let checkoutPromise;
export const loadCheckout = () => {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  checkoutPromise ||= new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = () => resolve(window.Razorpay || null);
    s.onerror = () => {
      checkoutPromise = undefined;
      resolve(null);
    };
    document.body.appendChild(s);
  });
  return checkoutPromise;
};

/** The signed-in user is a hall staff login (limited access). */
export const isStaffUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.userType === 'MS';
  } catch (e) {
    return false;
  }
};
