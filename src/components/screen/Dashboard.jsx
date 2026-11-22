import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import { endSession } from '../../utils/session';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import QuickActions, { DashboardPage } from './dashboard/QuickActions';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

/** Super-admin dashboard: quick access to every area. Live totals need a summary API for this role. */
const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useMemo(readUser, []);

  useEffect(() => {
    if (!user?.token) return;
    try {
      if (jwtDecode(user.token).exp < Date.now() / 1000) endSession();
    } catch (e) {
      /* token not decodable: leave the session as it is */
    }
  }, [user, navigate]);

  const actions = [
    { to: '/enquiries', label: t('enquiries', { defaultValue: 'Enquiries' }), description: t('enquiriesHint', { defaultValue: 'Messages from the website' }), icon: <MarkEmailUnreadOutlinedIcon />, color: '#ef4444' },
    { to: '/client-list', label: t('Clients'), description: t('clientsHint', { defaultValue: 'All Moitech customers' }), icon: <PeopleAltOutlinedIcon /> },
    { to: '/register-client?type=moitech', label: t('registerMoitechClient', { defaultValue: 'Register Moitech client' }), description: t('registerMoitechClientHint', { defaultValue: 'New Moitech account, 7 days free' }), icon: <PersonAddAltOutlinedIcon />, color: '#10b981' },
    { to: '/register-client?type=mahal', label: t('registerMahalOwner', { defaultValue: 'Register mahal owner' }), description: t('registerMahalOwnerHint', { defaultValue: 'New Mahal Management account, 1 month free' }), icon: <ApartmentOutlinedIcon />, color: '#f59e0b' },
    { to: '/mahal-bookings', label: t('mahalBookings', { defaultValue: 'Mahal bookings' }), description: t('mahalBookingListHint', { defaultValue: 'Requests, upcoming and past bookings' }), icon: <EventAvailableOutlinedIcon />, color: '#8b5cf6' },
    { to: '/my-mahals', label: t('myMahals', { defaultValue: 'All mahals' }), description: t('allMahalsHint', { defaultValue: 'Every hall and its online booking' }), icon: <EventNoteOutlinedIcon />, color: '#0ea5e9' },
    { to: '/function', label: t('functionMaster'), description: t('functionMasterHint', { defaultValue: 'Function types and settings' }), icon: <TuneOutlinedIcon />, color: '#64748b' },
    { to: '/user', label: t('userMaster'), description: t('userMasterHint', { defaultValue: 'Logins and roles' }), icon: <ManageAccountsOutlinedIcon />, color: '#ec4899' },
    { to: '/summary-report', label: t('summaryReport'), description: t('summaryReportHint', { defaultValue: 'Totals, PDF and Excel' }), icon: <AssessmentOutlinedIcon />, color: '#6366f1' },
  ];

  return (
    <DashboardPage title={t('dashboard')} subtitle={user?.name ? t('welcomeBackName', { defaultValue: 'Welcome back, {{name}}', name: user.name }) : undefined}>
      <Box sx={{ mb: 3 }}>
        <QuickActions actions={actions} />
      </Box>
      <Alert severity="info" variant="outlined">
        {t('suDashboardNote', { defaultValue: 'Live totals for clients, bookings and users will appear here once the summary API for this role is available.' })}
      </Alert>
    </DashboardPage>
  );
};

export default Dashboard;
