/**
 * Built-in answers for the "Ask us" chat box. Used when AI is switched off on the server, or when the AI call fails,
 * so visitors still get a useful reply with the right link. Keep prices and links in step with the pricing pages.
 */

export const SITE = 'https://mysuccess.azurewebsites.net';
export const SCHOOL_SITE = 'https://myschool-d5f9fueuajgvdkaj.westus3-01.azurewebsites.net';
export const PHONE = '+91 80503 86769';
export const WHATSAPP_URL = 'https://wa.me/918050386769?text=' + encodeURIComponent('Hi MySuccess, I have a question about your apps.');

const CONTACT = `For anything else, WhatsApp or call us on ${PHONE} (Mon–Sat, 9 AM–8 PM), or email mysuccesstechnologies@gmail.com.`;

export const FAQ = [
  {
    id: 'moitech',
    keys: ['moitech', 'moi', 'மொய்', 'function', 'wedding', 'marriage function', 'virunthu', 'விருந்து', 'gift', 'receipt', 'handover', 'கல்யாண'],
    answer:
      'DigiMoi records moi (gift money) at your functions on your phone: helpers enter from their own phones, voice input, Tamil spelling help, read a handwritten list from a photo, expenses, gold gifts, hand-over per helper, and Tamil PDF/Excel reports.\n' +
      `- Free trial for 7 days. Plans: Free ₹0 (100 entries), Standard ₹99/month, Premium ₹199/month.\n- Start: ${SITE}/purchase\n- Prices: ${SITE}/pricing?product=moitech\n- Guide: ${SITE}/user-guide/moitech`,
  },
  {
    id: 'mahal',
    keys: ['mahal', 'hall', 'மண்டபம்', 'மகால்', 'booking', 'book', 'party hall', 'kalyana mandapam', 'venue'],
    answer:
      'Mahal Management is for marriage and party hall owners: bookings with a calendar, double-booking warning, advance and balance, payments, WhatsApp the customer, and your own online booking page.\n' +
      `- 1 month free, then ₹4,999/month or ₹49,999/year.\n- Register your hall: ${SITE}/mahal-reg\n- Prices: ${SITE}/pricing?product=mahal\n` +
      `- Looking for a hall to book? Search here: ${SITE}/mahals`,
  },
  {
    id: 'school',
    keys: ['school', 'பள்ளி', 'erp', 'student', 'fees', 'fee', 'attendance', 'marks', 'parent', 'admission', 'teacher', 'report card'],
    answer:
      'School Website with ERP gives your school its own website plus fees, attendance, marks, report cards, parent login and AI helpers.\n' +
      `- 1 month free. Website ₹9,999/year. Website + ERP ₹29,999/year.\n- Live demo: ${SCHOOL_SITE}/\n- Register your school: ${SCHOOL_SITE}/register-school\n- Prices: ${SCHOOL_SITE}/pricing`,
  },
  {
    id: 'custom',
    keys: ['custom', 'billing', 'stock', 'inventory', 'app develop', 'website for', 'my business', 'shop'],
    answer:
      'We build custom web and mobile apps for billing, stock, bookings, customers, staff and reports, in Indian languages, usually within a month, with training and support. The first consultation is free.\n' +
      `- Tell us what you need: ${SITE}/contactus?topic=Custom%20Software`,
  },
  {
    id: 'health',
    keys: ['hospital', 'clinic', 'doctor', 'health', 'patient', 'pharmacy', 'medical'],
    answer:
      'Healthcare software (appointments, patient records, billing, pharmacy stock, reminders) is coming soon. Register your interest and we will call you:\n' +
      `- ${SITE}/contactus?topic=Healthcare%20Software`,
  },
  {
    id: 'price',
    keys: ['price', 'pricing', 'cost', 'plan', 'how much', 'rate', 'charges', 'விலை', 'கட்டணம்', 'free', 'trial', 'payment', 'upi'],
    answer:
      'You can start free on every product:\n' +
      '- DigiMoi: 7-day trial; Free ₹0, ₹99/month or ₹199/month\n- Mahal Management: 1 month free; ₹4,999/month or ₹49,999/year\n' +
      '- School Website: 1 month free; ₹9,999/year (website) or ₹29,999/year (website + ERP)\n' +
      `Pay by UPI, card or net banking. All prices: ${SITE}/pricing`,
  },
  {
    id: 'app',
    keys: ['android', 'mobile app', 'apk', 'download', 'install', 'play store', 'iphone', 'ios'],
    answer: `Get the Android app here: ${SITE}/download-app\nSign in with the same mobile number and password as the website. On iPhone, open the website in Safari; it works on any device.`,
  },
  {
    id: 'login',
    keys: ['login', 'log in', 'sign in', 'password', 'forgot', 'otp', 'account'],
    answer: `Sign in here: ${SITE}/login — use "Forgot password" on that page if needed. We never ask for your password or OTP in chat. ${CONTACT}`,
  },
  {
    id: 'guide',
    keys: ['guide', 'how to', 'help', 'tutorial', 'steps', 'manual', 'pdf'],
    answer: `Step-by-step guides (also as PDF): ${SITE}/user-guide\n- DigiMoi: ${SITE}/user-guide/moitech\n- Mahal: ${SITE}/user-guide/mahal\n- School: ${SITE}/user-guide/school`,
  },
  {
    id: 'language',
    keys: ['tamil', 'language', 'hindi', 'telugu', 'kannada', 'malayalam', 'தமிழ்'],
    answer: 'Every product works in English, தமிழ், हिन्दी, తెలుగు, ಕನ್ನಡ and മലയാളം. You can switch language any time from the top bar.',
  },
  {
    id: 'contact',
    keys: ['contact', 'call', 'phone', 'whatsapp', 'email', 'talk', 'demo', 'meeting', 'number', 'address'],
    answer: `WhatsApp or call ${PHONE} (Mon–Sat, 9 AM–8 PM IST), or email mysuccesstechnologies@gmail.com. Contact form: ${SITE}/contactus`,
  },
];

export const FALLBACK =
  'I can help with DigiMoi (moi accounting), Mahal Management (hall bookings), School Website with ERP, custom software and prices. ' +
  `Try asking "How much is DigiMoi?" or "School ERP features". ${CONTACT}`;

const norm = (s) => (s || '').toLowerCase();

/** Best built-in answer for a question (most matching keywords wins; ties go to the earlier, more specific topic). */
export const faqAnswer = (question) => {
  const q = norm(question);
  let best = null;
  let bestScore = 0;
  for (const item of FAQ) {
    const score = item.keys.reduce((n, k) => n + (q.includes(k) ? k.length : 0), 0);
    if (score > bestScore) {
      best = item;
      bestScore = score;
    }
  }
  return best ? best.answer : FALLBACK;
};
