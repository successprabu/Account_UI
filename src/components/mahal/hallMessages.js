/**
 * WhatsApp messages a hall sends to its customers (reminders, thank-you, Moitech offer, invoice summary), in English
 * and Tamil, plus a printable invoice. Messages go out with click-to-send links: free, from the hall's own WhatsApp.
 */
import { fmtRange, rupees } from './shared';

export const waDigits = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};
export const waLink = (phone, text) => `https://wa.me/${waDigits(phone)}?text=${encodeURIComponent(text)}`;

export const MOITECH_LINK = 'https://mysuccess.azurewebsites.net/purchase';
const STATUS_LINK = 'https://mysuccess.azurewebsites.net/mahals/status';
const REVIEW_LINK = 'https://mysuccess.azurewebsites.net/mahals/review';

const TEXT = {
  en: {
    balance: (r) => `Hello ${r.customerName}, a reminder from ${r.mahalName}: your ${r.eventType || 'event'} is on ${fmtRange(r.fromDate, r.toDate)}. Balance due: ${rupees(r.balance)}. Please pay before the event. Ref ${r.bookingRef || ''}. Pay or check: ${STATUS_LINK}?ref=${r.bookingRef || ''}`,
    tomorrow: (r) => `Hello ${r.customerName}, your ${r.eventType || 'event'} at ${r.mahalName} is tomorrow (${fmtRange(r.fromDate, r.toDate)}). We are ready for you. For anything, call ${r.hallPhone || 'the hall'}.`,
    thanks: (r) => `Thank you ${r.customerName} for celebrating at ${r.mahalName}! We hope everything went well. Please rate us here: ${REVIEW_LINK}?ref=${r.bookingRef || ''} and remember us for your next function.`,
    moitech: (r) => `Hello ${r.customerName}, congratulations on your ${r.eventType || 'function'} at ${r.mahalName}! Record every moi gift on your phone with Moitech, free for 7 days. Helpers can write from their own phones and you get totals the same evening: ${MOITECH_LINK}`,
    invoice: (inv) => `Hello ${inv.booking.customerName}, invoice ${inv.invoiceNumber} from ${inv.hall.mahalName} for ${fmtRange(inv.booking.fromDate, inv.booking.toDate)}. Total ${rupees(inv.amounts.total)}, paid ${rupees(inv.amounts.paid)}, balance ${rupees(inv.amounts.balance)}. Thank you!`,
  },
  ta: {
    balance: (r) => `வணக்கம் ${r.customerName}, ${r.mahalName} நினைவூட்டல்: உங்கள் ${r.eventType || 'நிகழ்வு'} ${fmtRange(r.fromDate, r.toDate)} அன்று. மீதித் தொகை: ${rupees(r.balance)}. நிகழ்வுக்கு முன் செலுத்தவும். எண் ${r.bookingRef || ''}. செலுத்த / பார்க்க: ${STATUS_LINK}?ref=${r.bookingRef || ''}`,
    tomorrow: (r) => `வணக்கம் ${r.customerName}, ${r.mahalName}-இல் உங்கள் ${r.eventType || 'நிகழ்வு'} நாளை (${fmtRange(r.fromDate, r.toDate)}). நாங்கள் தயாராக உள்ளோம். ஏதேனும் தேவைக்கு ${r.hallPhone || 'மண்டபத்தை'} அழைக்கவும்.`,
    thanks: (r) => `${r.mahalName}-இல் கொண்டாடியதற்கு நன்றி ${r.customerName}! எல்லாம் சிறப்பாக நடந்திருக்கும் என நம்புகிறோம். உங்கள் மதிப்பீட்டை இங்கே தாருங்கள்: ${REVIEW_LINK}?ref=${r.bookingRef || ''} — அடுத்த விழாவுக்கும் எங்களை நினைவில் கொள்ளுங்கள்.`,
    moitech: (r) => `வணக்கம் ${r.customerName}, ${r.mahalName}-இல் உங்கள் ${r.eventType || 'விழா'}க்கு வாழ்த்துகள்! ஒவ்வொரு மொய்யையும் Moitech மூலம் கைபேசியில் பதிவு செய்யுங்கள் — 7 நாட்கள் இலவசம். உதவியாளர்கள் தங்கள் கைபேசியிலேயே எழுதலாம், அன்று மாலையே மொத்தம் கிடைக்கும்: ${MOITECH_LINK}`,
    invoice: (inv) => `வணக்கம் ${inv.booking.customerName}, ${inv.hall.mahalName} விலைப்பட்டியல் ${inv.invoiceNumber} — ${fmtRange(inv.booking.fromDate, inv.booking.toDate)}. மொத்தம் ${rupees(inv.amounts.total)}, செலுத்தியது ${rupees(inv.amounts.paid)}, மீதி ${rupees(inv.amounts.balance)}. நன்றி!`,
  },
};

/** Message text for a reminder kind (balance, tomorrow, thanks, moitech) or 'invoice'. lang: 'ta' gives Tamil, else English. */
export const hallMessage = (kind, data, lang) => (TEXT[lang === 'ta' ? 'ta' : 'en'][kind] || TEXT.en[kind])(data);

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

/**
 * Opens the invoice as a clean A4 page and the print dialog ("Save as PDF" on phones and computers).
 * Uses the browser's own fonts, so Tamil names print correctly. Returns false if pop-ups are blocked.
 */
export const printInvoice = (inv) => {
  const h = inv.hall;
  const a = inv.amounts;
  const gst = h.gstEnabled && h.gstRate > 0;
  const address = [h.addressLine1, h.addressLine2, h.landmark, [h.districtName, h.stateName].filter(Boolean).join(', '), h.pincode]
    .filter(Boolean).map(esc).join(', ');
  // Package and add-on lines when the booking has them (the hall rent line is the rest of the total).
  const rows = [
    ...(inv.lines?.length ? inv.lines.map((l) => [l.label, l.amount]) : [['Hall rent', a.rent]]),
    ...(a.discount > 0 ? [['Discount', -a.discount]] : []),
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(inv.invoiceNumber)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  body { font-family: Inter, "Noto Sans Tamil", system-ui, sans-serif; color: #0f172a; font-size: 13px; }
  h1 { font-size: 22px; margin: 0; } .muted { color: #64748b; } .right { text-align: right; }
  .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #7f1d1d; padding-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; } td, th { padding: 8px 6px; border-bottom: 1px solid #e2e8f0; text-align: left; }
  th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #475569; }
  .total td { font-weight: 700; font-size: 15px; border-top: 2px solid #0f172a; }
  .box { display: flex; justify-content: space-between; gap: 24px; margin-top: 16px; }
  .foot { margin-top: 32px; font-size: 11px; color: #64748b; }
</style></head><body>
<div class="top"><div><h1>${esc(h.mahalName)}</h1><div class="muted">${address}</div>
${h.contactNumber ? `<div>Phone: ${esc(h.contactNumber)}</div>` : ''}${gst ? `<div><b>GSTIN: ${esc(h.gstin)}</b></div>` : ''}</div>
<div class="right"><div style="font-size:18px;font-weight:700">${gst ? 'TAX INVOICE' : 'INVOICE'}</div>
<div>No. <b>${esc(inv.invoiceNumber)}</b></div><div>Date: ${day(inv.invoiceDate)}</div><div class="muted">Booking ${esc(inv.booking.bookingRef || '')}</div></div></div>
<div class="box"><div><div class="muted">Billed to</div><b>${esc(inv.booking.customerName)}</b><div>${esc(inv.booking.primary_phone)}</div>${inv.booking.email ? `<div>${esc(inv.booking.email)}</div>` : ''}</div>
<div class="right"><div class="muted">Event</div><b>${esc(inv.booking.eventType || 'Event')}</b><div>${esc(fmtRange(inv.booking.fromDate, inv.booking.toDate))}</div>${inv.booking.guestCount ? `<div>${esc(inv.booking.guestCount)} guests</div>` : ''}</div></div>
<table><tr><th>Description</th><th class="right">Amount (₹)</th></tr>
${rows.map(([t, v]) => `<tr><td>${esc(t)}</td><td class="right">${esc(rupees(v))}</td></tr>`).join('')}
${gst ? `<tr><td>Taxable value (SAC 997212)</td><td class="right">${esc(rupees(a.taxable))}</td></tr>
<tr><td>CGST @ ${h.gstRate / 2}%</td><td class="right">${esc(rupees(a.cgst))}</td></tr>
<tr><td>SGST @ ${h.gstRate / 2}%</td><td class="right">${esc(rupees(a.sgst))}</td></tr>` : ''}
<tr class="total"><td>Total${gst ? ' (incl. GST)' : ''}</td><td class="right">${esc(rupees(a.total))}</td></tr></table>
<table><tr><th>Payments received</th><th>Method</th><th class="right">Amount (₹)</th></tr>
${inv.payments.length ? inv.payments.map((p) => `<tr><td>${day(p.date)}</td><td>${esc(p.payMethod || '')}${p.online ? ' (online)' : ''}</td><td class="right">${esc(rupees(p.amount))}</td></tr>`).join('') : `<tr><td colspan="2">Paid so far</td><td class="right">${esc(rupees(a.paid))}</td></tr>`}
<tr class="total"><td colspan="2">Balance due</td><td class="right">${esc(rupees(a.balance))}</td></tr></table>
<div class="foot">This is a computer-generated invoice. Made with My Success · mysuccess.azurewebsites.net</div>
<script>window.onload = () => setTimeout(() => window.print(), 300);</script>
</body></html>`;
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open();
  w.document.write(html);
  w.document.close();
  return true;
};
