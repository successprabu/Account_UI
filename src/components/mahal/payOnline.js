import { createPayOrder, loadCheckout, verifyPay } from '../../api/mahalOps';

/**
 * Pays what is due now on a booking, online, into the hall's own Razorpay account:
 * order on the server → Razorpay Checkout → the server checks the signature and records the payment.
 * Resolves to { ok: true, message, data } when paid, { ok: false, message } on an error,
 * or { ok: false, cancelled: true } if the customer closes the window.
 * tx: the site translator, for messages shown before the server answers.
 */
export const payOnline = async ({ bookingRef, phone, tx = (s) => s }) => {
  const order = await createPayOrder(bookingRef, phone);
  if (!order.ok) return { ok: false, message: order.message };
  const Razorpay = await loadCheckout();
  if (!Razorpay) return { ok: false, message: tx('Could not open the payment window. Check your connection and try again.') };

  const o = order.data;
  return new Promise((resolve) => {
    let done = false;
    let failed = false; // a failed try keeps the window open for another try
    const finish = (r) => {
      if (!done) {
        done = true;
        resolve(r);
      }
    };
    const rzp = new Razorpay({
      key: o.keyId,
      order_id: o.orderId,
      amount: Math.round(o.amount * 100),
      currency: o.currency,
      name: o.hallName,
      description: tx('Booking {{ref}}', { ref: bookingRef }),
      prefill: { name: o.customerName, contact: o.phone, email: o.email || undefined },
      theme: { color: '#7F1D1D' },
      modal: {
        ondismiss: () => finish(failed
          ? { ok: false, message: tx('The payment did not go through. No money was taken. Please try again.') }
          : { ok: false, cancelled: true }),
      },
      handler: async (r) => {
        const res = await verifyPay({
          bookingRef,
          phone,
          razorpayOrderId: r.razorpay_order_id,
          razorpayPaymentId: r.razorpay_payment_id,
          razorpaySignature: r.razorpay_signature,
        });
        finish(res.ok ? { ok: true, message: res.message, data: res.data } : { ok: false, message: res.message });
      },
    });
    rzp.on('payment.failed', () => {
      failed = true;
    });
    rzp.open();
  });
};
