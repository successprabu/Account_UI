import { auth, call } from './mahal';

/** Mahal Phase 2 (API: MahalPlusController): day prices, packages and add-ons, quotes and customer reviews. */
const R = 'MahalPlus/';

// ---- owner
/** pricing: { mahalId, weekendPrice, muhurthamPrice, weekdayDiscount, specialDates: ['2026-12-04', …] } */
export const savePricing = (pricing) => call({ method: 'post', url: `${R}SavePricing`, data: pricing, headers: auth() });
export const listPackages = (mahalId) => call({ method: 'get', url: `${R}Packages`, params: { mahalId }, headers: auth() });
/** item: { id, mahalId, kind: 'package'|'addon', name, description, price, unit: 'day'|'event', sortOrder, isActive } */
export const savePackage = (item) => call({ method: 'post', url: `${R}SavePackage`, data: item, headers: auth() });
export const deletePackage = (id) => call({ method: 'post', url: `${R}DeletePackage`, params: { id }, headers: auth() });
/** from/to as on bookings ("2026-12-04T06:00:00", end exclusive). Resolves data { days, rent, package, addons, total }. */
export const getQuote = ({ mahalId, from, to, packageId, addonIds }) =>
  call({ method: 'get', url: `${R}Quote`, params: { mahalId, from, to, packageId: packageId || undefined, addonIds }, headers: auth(), paramsSerializer: { indexes: null } });
export const listReviews = (mahalId) => call({ method: 'get', url: `${R}Reviews`, params: { mahalId: mahalId || undefined }, headers: auth() });
export const replyReview = (id, reply) => call({ method: 'post', url: `${R}Reviews/Reply`, data: { id, reply }, headers: auth() });
export const hideReview = (id, hidden) => call({ method: 'post', url: `${R}Reviews/Hide`, data: { id, hidden }, headers: auth() });

// ---- public (booking site)
/** data { packages, addons, rating: { average, count }, reviews } */
export const getHallExtras = (mahalId) => call({ method: 'get', url: `${R}Public/Hall`, params: { mahalId } });
export const getRatings = (ids) => call({ method: 'get', url: `${R}Public/Ratings`, params: { ids }, paramsSerializer: { indexes: null } });
/** from/lastDay: "yyyy-MM-dd", both included. */
export const getPublicQuote = ({ mahalId, from, lastDay, packageId, addonIds }) =>
  call({ method: 'get', url: `${R}Public/Quote`, params: { mahalId, from, lastDay, packageId: packageId || undefined, addonIds }, paramsSerializer: { indexes: null } });
export const checkReview = (bookingRef, phone) => call({ method: 'get', url: `${R}Public/Review`, params: { bookingRef, phone } });
export const submitReview = (review) => call({ method: 'post', url: `${R}Public/Review`, data: review });

export const REVIEW_LINK = 'https://mysuccess.azurewebsites.net/mahals/review';

/** Price kind of a day in a quote → short label. */
export const DAY_KIND = { muhurtham: 'Muhurtham day', weekend: 'Weekend', weekday: 'Weekday' };
