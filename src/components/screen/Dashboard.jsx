import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Box } from '@mui/material';
import { jwtDecode } from 'jwt-decode';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
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
      if (jwtDecode(user.token).exp < Date.now() / 1000) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    } catch (e) {
      /* token not decodable: leave the session as it is */
    }
  }, [user, navigate]);

  const actions = [
    { to: '/client-list', label: t('Clients'), description: t('clientsHint', { defaultValue: 'All Moitech customers' }), icon: <PeopleAltOutlinedIcon /> },
    { to: '/add-moitech-customer', label: t('addMoiTechCustomer'), description: t('addMoiTechCustomerHint', { defaultValue: 'Register a new customer' }), icon: <PersonAddAltOutlinedIcon />, color: '#10b981' },
    { to: '/add-new-mahal', label: t('addMahal'), description: t('addMahalHint', { defaultValue: 'Register a marriage hall' }), icon: <ApartmentOutlinedIcon />, color: '#f59e0b' },
    { to: '/mahal-booking', label: t('mahalBooking'), description: t('mahalBookingHint', { defaultValue: 'Book a hall for an event' }), icon: <EventAvailableOutlinedIcon />, color: '#8b5cf6' },
    { to: '/mahal-booking-list', label: t('mahalBookingList'), description: t('mahalBookingListHint', { defaultValue: 'Upcoming and past bookings' }), icon: <EventNoteOutlinedIcon />, color: '#0ea5e9' },
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
