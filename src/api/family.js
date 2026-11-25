import { auth, call } from './mahal';

/** Moitech family features (API: Family/* and MoiGiven/*Invite*). Same { ok, message, data } results as api/mahal. */

// ---- WhatsApp thank-you
/** data { function, items, total, withPhone, thanked } — receipts with a mobile number. */
export const listThanks = (functionId) => call({ method: 'get', url: 'Family/Thanks', params: { functionId }, headers: auth() });
export const markThanked = (id, undo = false) => call({ method: 'post', url: 'Family/Thanked', params: { id, undo }, headers: auth() });

// ---- live totals link
export const getLiveShare = (functionId) => call({ method: 'get', url: 'Family/LiveShare', params: { functionId }, headers: auth() });
/** { functionId, pin } sets the PIN (and makes the link); { functionId, off: true } turns it off. */
export const setLiveShare = (req) => call({ method: 'post', url: 'Family/LiveShare', data: req, headers: auth() });
/** Public (no sign-in): { token, pin } → totals, or { needPin } without a PIN. */
export const getLiveTotals = (token, pin) => call({ method: 'post', url: 'Family/Live', data: { token, pin } });

// ---- moi to return
/** data { items, planned, given, skipped, dueWeek }; status: Planned | Given | Skipped. */
export const listInvites = (status = 'Planned') => call({ method: 'get', url: 'MoiGiven/Invites', params: { status }, headers: auth() });
export const saveInvite = (invite) => call({ method: 'post', url: 'MoiGiven/SaveInvite', data: invite, headers: auth() });
/** { id, status: 'Given' | 'Skipped' | 'Planned', amount } */
export const setInviteStatus = (req) => call({ method: 'post', url: 'MoiGiven/InviteStatus', data: req, headers: auth() });
export const deleteInvite = (id) => call({ method: 'post', url: 'MoiGiven/DeleteInvite', params: { id }, headers: auth() });
