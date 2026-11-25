/**
 * Partner (reseller) signup links: ?ref=CODE on any page is kept for 60 days in this browser, and sent as
 * referedBy "P:CODE" when the visitor registers. The server keeps it only for an active partner.
 */
const KEY = 'mysuccess.partnerRef';
const DAYS = 60;

export const capturePartnerRef = () => {
  try {
    const code = new URLSearchParams(window.location.search).get('ref');
    if (code && /^[A-Za-z0-9]{4,20}$/.test(code)) {
      localStorage.setItem(KEY, JSON.stringify({ code: code.toUpperCase(), until: Date.now() + DAYS * 86400000 }));
    }
  } catch (e) { /* private mode */ }
};

/** "P:CODE" when a partner link was opened in the last 60 days, else undefined. */
export const partnerRef = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return v && v.until > Date.now() ? `P:${v.code}` : undefined;
  } catch (e) {
    return undefined;
  }
};
