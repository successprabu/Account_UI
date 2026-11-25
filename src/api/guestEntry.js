import { auth, call } from './mahal';

/** Moitech guest self-entry by QR (API: GuestEntryController). Same { ok, message, data } results as api/mahal. */
const R = 'GuestEntry/';

/** data { id, functionName, token, url, pending } — the link is made the first time. */
export const getGuestQr = (functionId) => call({ method: 'get', url: `${R}Qr`, params: { functionId }, headers: auth() });
/** Owner: a new link; the old QR stops working. */
export const resetGuestQr = (functionId) => call({ method: 'post', url: `${R}ResetQr`, params: { functionId }, headers: auth() });
/** data { items, pending, accepted, rejected }; status: Pending | Accepted | Rejected. */
export const listGuestEntries = (functionId, status = 'Pending') => call({ method: 'get', url: `${R}Entries`, params: { functionId, status }, headers: auth() });
/** { id, accept, villageName?, name?, initial?, amount?, payMode? } */
export const decideGuestEntry = (decision) => call({ method: 'post', url: `${R}Decide`, data: decision, headers: auth() });

// ---- guest page (no sign-in)
export const getGuestPage = (token) => call({ method: 'get', url: `${R}Public`, params: { token } });
export const sendGuestEntry = (entry) => call({ method: 'post', url: `${R}Public`, data: entry });
