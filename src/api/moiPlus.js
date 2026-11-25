import { auth, call } from './mahal';
import { loadCheckout } from './mahalOps';

/** Moitech Phase 2 (API: MoiPlus/*). Same { ok, message, data } results as api/mahal. */
const R = 'MoiPlus/';

export const getMoiBook = (functionId) => call({ method: 'get', url: `${R}Book`, params: { functionId }, headers: auth() });

export const getGold = (functionId) => call({ method: 'get', url: `${R}Gold`, params: { functionId }, headers: auth() });
export const setGoldRate = (functionId, rate) => call({ method: 'post', url: `${R}Gold`, data: { functionId, rate }, headers: auth() });

export const getInvite = (functionId) => call({ method: 'get', url: `${R}Invite`, params: { functionId }, headers: auth() });
export const getInviteCard = (token) => call({ method: 'get', url: `${R}Invite/Public`, params: { token } });
export const sendRsvp = (reply) => call({ method: 'post', url: `${R}Rsvp`, data: reply });

export const listNotebooks = () => call({ method: 'get', url: `${R}Notebooks`, headers: auth() });
export const addNotebook = (fn) => call({ method: 'post', url: `${R}Notebooks`, data: fn, headers: auth() });
/** image: base64 without the data: prefix. */
export const readNotebookPage = (functionId, image, mediaType) =>
  call({ method: 'post', url: `${R}Notebooks/Read`, data: { functionId, image, mediaType }, headers: auth(), timeout: 120000 });
export const saveNotebook = (functionId, rows) => call({ method: 'post', url: `${R}Notebooks/Save`, data: { functionId, rows }, headers: auth() });

/**
 * Buys a one-function pass: makes the order on the server (price set there), opens Razorpay Checkout, then has the
 * server check the payment. Resolves to { ok, message }.
 */
export const buyFunctionPass = async (functionId) => {
  const o = await call({ method: 'post', url: `${R}PassOrder`, data: { functionId }, headers: auth() });
  if (!o.ok) return o;
  const Razorpay = await loadCheckout();
  if (!Razorpay) return { ok: false, message: 'Could not open the payment window. Check your connection and try again.' };
  return new Promise((resolve) => {
    const rz = new Razorpay({
      key: o.data.key,
      order_id: o.data.orderId,
      amount: o.data.amount,
      currency: o.data.currency,
      name: 'Moitech',
      description: `Function pass: ${o.data.functionName}`,
      prefill: { name: o.data.name, contact: o.data.phone },
      theme: { color: '#6366F1' },
      handler: async (res) => {
        const v = await call({
          method: 'post',
          url: `${R}PassVerify`,
          data: { functionId, orderId: res.razorpay_order_id, paymentId: res.razorpay_payment_id, signature: res.razorpay_signature },
          headers: auth(),
        });
        resolve(v);
      },
      modal: { ondismiss: () => resolve({ ok: false, message: '', cancelled: true }) },
    });
    rz.open();
  });
};
