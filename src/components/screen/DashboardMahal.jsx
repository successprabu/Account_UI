import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box } from '@mui/material';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import QuickActions, { DashboardPage } from './dashboard/QuickActions';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

/** Mahal admin dashboard: quick access to bookings. Live figures need a bookings summary API. */
const DashboardMahal = () => {
  const { t } = useTranslation();
  const user = useMemo(readUser, []);

  const actions = [
    { to: '/mahal-booking', label: t('mahalBooking'), description: t('mahalBookingHint', { defaultValue: 'Book a hall for an event' }), icon: <EventAvailableOutlinedIcon /> },
    { to: '/mahal-booking-list', label: t('mahalBookingList'), description: t('mahalBookingListHint', { defaultValue: 'Upcoming and past bookings' }), icon: <EventNoteOutlinedIcon />, color: '#0ea5e9' },
    { to: '/add-new-mahal', label: t('addMahal'), description: t('addMahalHint', { defaultValue: 'Register a marriage hall' }), icon: <ApartmentOutlinedIcon />, color: '#f59e0b' },
    { to: '/add-moitech-customer', label: t('addMoiTechCustomer'), description: t('addMoiTechCustomerHint', { defaultValue: 'Register a new customer' }), icon: <PersonAddAltOutlinedIcon />, color: '#10b981' },
    { to: '/settings', label: t('Theme Settings', { defaultValue: 'Theme settings' }), description: t('themeSettingsHint', { defaultValue: 'Colours, dark mode, menu position' }), icon: <PaletteOutlinedIcon />, color: '#8b5cf6' },
  ];

  return (
    <DashboardPage title={t('dashboard')} subtitle={user?.name ? t('welcomeBackName', { defaultValue: 'Welcome back, {{name}}', name: user.name }) : undefined}>
      <Box sx={{ mb: 3 }}>
        <QuickActions actions={actions} />
      </Box>
      <Alert severity="info" variant="outlined">
        {t('mahalDashboardNote', { defaultValue: 'Booking counts, upcoming events and payments due will appear here once the bookings summary API is available.' })}
      </Alert>
    </DashboardPage>
  );
};

export default DashboardMahal;
