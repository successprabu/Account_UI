import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import { Link as RouterLink } from 'react-router-dom';

export const SCHOOL_ERP_URL = 'https://myschool-d5f9fueuajgvdkaj.westus3-01.azurewebsites.net/';
export const SCHOOL_PRICING_URL = 'https://myschool-d5f9fueuajgvdkaj.westus3-01.azurewebsites.net/pricing';

/** Props that make a MUI Button or MenuItem follow a product link: in-app route or external site. */
export const linkProps = (link) =>
  link?.href
    ? { component: 'a', href: link.href, target: '_blank', rel: 'noopener noreferrer' } // 'a' so menu items (li by default) also open the link
    : { component: RouterLink, to: link?.to };

/**
 * The MySuccess products. Each live product has its own demo and pricing link. Titles and long descriptions come from the
 * translation files (titleKey / descriptionKey) so they show in all languages.
 */
export const PRODUCTS = [
  {
    id: 'moitech',
    titleKey: 'moitech',
    title: 'Moitech',
    descriptionKey: 'moitechDescription',
    tagline: 'Moi and function accounting, done in minutes',
    summary:
      'Record every moi gift by name, village and amount during the function, then see totals, expenses and the handover summary the same evening.',
    icon: <VolunteerActivismOutlinedIcon />,
    color: '#6366f1',
    features: [
      'Record moi entries by name, village and amount',
      'Type names in Tamil from an English keyboard',
      'Track function expenses and other receipts',
      'Income, expense and village-wise reports as PDF or Excel',
      'Handover summary for the family at the end',
    ],
    cta: { label: 'Try Moitech free', to: '/purchase' },
    demo: { label: 'Start the free trial', to: '/purchase' },
    pricing: { to: '/pricing?product=moitech' },
  },
  {
    id: 'mahal',
    titleKey: 'mahalManagement',
    title: 'Mahal Management',
    descriptionKey: 'mahalDescription',
    tagline: 'Bookings, payments and expenses for marriage halls',
    summary:
      'See which dates are free, book events, record advances and balances, and keep every hall expense in one place.',
    icon: <ApartmentOutlinedIcon />,
    color: '#f59e0b',
    features: [
      'Online booking site: customers find your hall, check free dates and send requests',
      'Booking calendar with real-time availability and no double bookings',
      'Approve requests, take direct bookings for marriages, birthdays and more',
      'Advance, balance and payment records',
      'Hall expense tracking',
      'Booking and payment reports',
    ],
    cta: { label: 'Register your mahal', to: '/mahal-reg' },
    // For hall owners: register the mahal and use the app free for 1 month.
    demo: { label: 'Register your mahal, 1 month free', to: '/mahal-reg' },
    pricing: { to: '/pricing?product=mahal' },
  },
  {
    id: 'school',
    titleKey: 'schoolWebsiteERP',
    title: 'School Website with ERP',
    descriptionKey: 'schoolDescription',
    tagline: 'A school website and office system in one',
    summary:
      'A public website for your school plus the office tools behind it: students, attendance, exams, fees and a portal for parents and teachers.',
    icon: <SchoolOutlinedIcon />,
    color: '#10b981',
    features: [
      'Student records and admissions',
      'Attendance and exam results',
      'Fee collection and receipts',
      'Portal for teachers, students and parents',
      'School website with news and updates',
    ],
    cta: { label: 'Open School ERP', href: SCHOOL_ERP_URL },
    demo: { label: 'Open the School ERP demo', href: SCHOOL_ERP_URL },
    // School has its own price list on the School ERP site
    pricing: { href: SCHOOL_PRICING_URL },
  },
  {
    id: 'custom',
    titleKey: 'customSoftware',
    title: 'Custom Software',
    descriptionKey: 'customSoftwareDescription',
    tagline: 'Software built around your business',
    summary:
      'Tell us how your business works. We design and build software made for your process and deliver it within a month.',
    icon: <DashboardCustomizeOutlinedIcon />,
    color: '#0ea5e9',
    features: [
      'Free consultation to understand your business',
      'Web and mobile apps designed around how you work',
      'Billing, stock, bookings, customers, staff and reports',
      'In English and Indian languages, on any device',
      'Ready within a month, with training and ongoing support',
    ],
    cta: { label: 'Tell us your requirement', to: '/contactus?topic=Custom%20Software' },
  },
  {
    id: 'healthcare',
    titleKey: 'healthcareSoftware',
    title: 'Healthcare Software',
    descriptionKey: 'healthcareDescription',
    tagline: 'Clinic and hospital management, coming soon',
    summary:
      'Appointments, patient records, billing and pharmacy stock for clinics and small hospitals, with reminders for patients and reports for doctors.',
    icon: <LocalHospitalOutlinedIcon />,
    color: '#ef4444',
    comingSoon: true,
    features: [
      'Appointment booking and queue display',
      'Patient records, prescriptions and visit history',
      'Billing, receipts and insurance details',
      'Pharmacy and consumables stock',
      'SMS and WhatsApp reminders for patients',
    ],
    cta: { label: 'Register interest', to: '/contactus?topic=Healthcare%20Software' },
  },
];

/** Products people can use today. */
export const LIVE_PRODUCTS = PRODUCTS.filter((p) => !p.comingSoon);

/** Products with a demo to try (Custom Software starts with a conversation instead). */
export const DEMO_PRODUCTS = LIVE_PRODUCTS.filter((p) => p.demo);

export const CONTACT = {
  email: 'mysuccesstechnologies@gmail.com',
  phoneDisplay: '+91 80503 86769',
  phoneTel: '+918050386769',
  whatsapp: '918050386769',
  city: 'Bangalore, India',
  hours: 'Mon – Sat, 9:00 AM – 8:00 PM IST',
};
