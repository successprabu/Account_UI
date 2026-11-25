import { auth, call } from './mahal';

/** Client for plan auto-renewal (API: AutoPayController) using Razorpay Subscriptions. All need sign-in. */
const R = 'AutoPay/';

/** Creates a Razorpay subscription; resolves data { keyId, subscriptionId, amount, name, plan, billingCycle }. */
export const startAutoPay = (plan, billingCycle) => call({ method: 'post', url: `${R}Start`, data: { plan, billingCycle }, headers: auth() });
/** Sends Checkout's handler response for checking and turning the plan on. */
export const verifyAutoPay = (r) => call({
  method: 'post',
  url: `${R}Verify`,
  data: { razorpaySubscriptionId: r.razorpay_subscription_id, razorpayPaymentId: r.razorpay_payment_id, razorpaySignature: r.razorpay_signature },
  headers: auth(),
});
/** data { subscription, autoPay } for the signed-in account. */
export const myAutoPay = () => call({ method: 'get', url: `${R}Mine`, headers: auth() });
/** Stops renewal at the end of the paid period. */
export const cancelAutoPay = () => call({ method: 'post', url: `${R}Cancel`, headers: auth() });
