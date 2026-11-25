import { auth, call } from './mahal';

/** Resellers and partners (API: Partner/*). Same { ok, message, data } results as api/mahal. */
export const getMyPartner = () => call({ method: 'get', url: 'Partner/Mine', headers: auth() });
export const applyPartner = (req) => call({ method: 'post', url: 'Partner/Apply', data: req, headers: auth() });
export const listPartners = () => call({ method: 'get', url: 'Partner/Admin', headers: auth() });
export const getPartnerDetail = (id) => call({ method: 'get', url: 'Partner/Admin/Detail', params: { id }, headers: auth() });
export const updatePartner = (req) => call({ method: 'post', url: 'Partner/Admin/Update', data: req, headers: auth() });
export const addPartnerPayout = (req) => call({ method: 'post', url: 'Partner/Admin/Payout', data: req, headers: auth() });
