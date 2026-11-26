import { Box, Container, Link, Typography } from '@mui/material';
import AppHeader from '../common/AppHeader';
import PublicFooter from '../public/PublicFooter';
import { CONTACT } from '../public/products';

/**
 * Privacy policy for the website and the My Success Android app (needed for Google Play).
 * Kept in plain English; update the date when anything changes.
 */
const UPDATED = '26 November 2026';

const SECTIONS = [
  {
    title: 'Who we are',
    body: [
      `MySuccess Technologies, ${CONTACT.city}, makes DigiMoi (moi accounts for family functions), Mahal Management (marriage and party halls) and School Website & ERP. This policy covers our websites and the My Success Android app.`,
    ],
  },
  {
    title: 'What we collect',
    body: [
      'Account details: your name, mobile number, email (if you give it) and your password, which we store only in a scrambled (hashed) form that nobody can read.',
      'What you enter: moi receipts, expenses, gifts and guest entries (DigiMoi); halls, bookings, customers, vendors and payments (Mahal); students, parents, attendance, marks, fees, homework, circulars, admissions, bus and library records (School ERP, entered by the school).',
      'Photos you choose to upload, such as notebook pages, hall photos, homework photos, student photos and application documents.',
      'On the app: a notification token so we can send you school alerts, and your app settings (language, theme, app lock). Fingerprint or face checks for the app lock happen only on your phone; we never receive them.',
      'Basic technical logs (time, page, error messages) to keep the service working and secure.',
    ],
  },
  {
    title: 'How we use it',
    body: [
      'Only to run the service you signed up for: show your records, make reports and receipts, send messages you ask for (WhatsApp, email, SMS one-time passwords and app notifications), and answer your questions.',
      'AI features (for example, reading a notebook photo or answering a parent\'s question) send only the needed text or photo to our AI provider (Anthropic) to produce the answer. It is not used to train their models.',
      'We do not sell your data and we do not show advertising.',
    ],
  },
  {
    title: 'Who else sees it',
    body: [
      'People you give access to: helpers you add to a function, hall staff, school staff with the right role, and parents for their own children only.',
      'Service providers that run parts of the service for us: Microsoft Azure (hosting), Razorpay (online payments; we never see card or UPI PIN details), Google Firebase (app notifications), email and SMS providers, and Anthropic (AI features).',
      'Authorities, only when the law requires it.',
    ],
  },
  {
    title: 'How we protect it',
    body: [
      'All traffic uses HTTPS. Passwords are hashed. Sign-ins expire and can be ended on every device ("Sign out of all devices"). On the app, sign-in tokens are kept in the phone\'s secure storage, and you can turn on an app lock.',
    ],
  },
  {
    title: 'Children\'s data',
    body: [
      'Student data in School ERP is entered and controlled by the school. Parents can see only their own children. To correct or remove a child\'s data, please contact the school; we help the school do it.',
    ],
  },
  {
    title: 'Keeping and deleting data',
    body: [
      'We keep your data while your account is active, so your records and reports stay available. You can ask us to delete your account and its data at any time by email or WhatsApp; we do it within 30 days, except records we must keep by law.',
      'Under India\'s Digital Personal Data Protection Act, 2023 you can ask to see, correct or delete your personal data, and to withdraw consent.',
    ],
  },
  {
    title: 'Contact',
    body: [`Email ${CONTACT.email} or call / WhatsApp ${CONTACT.phoneDisplay} (${CONTACT.hours}).`],
  },
];

const PrivacyPolicy = () => (
  <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
    <AppHeader />
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 }, flex: 1 }}>
      <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 30, md: 40 } }}>
        Privacy policy
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1 }}>
        Last updated: {UPDATED}
      </Typography>
      {SECTIONS.map((s) => (
        <Box key={s.title} component="section" sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
            {s.title}
          </Typography>
          {s.body.map((p) => (
            <Typography key={p.slice(0, 40)} sx={{ mt: 1.2, lineHeight: 1.7 }}>
              {p}
            </Typography>
          ))}
        </Box>
      ))}
      <Typography sx={{ mt: 4 }}>
        Questions? <Link href={`mailto:${CONTACT.email}`}>{CONTACT.email}</Link>
      </Typography>
    </Container>
    <PublicFooter />
  </Box>
);

export default PrivacyPolicy;
