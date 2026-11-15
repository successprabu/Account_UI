import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert, Box, Button, Grid, Skeleton, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DASHBOARD_DETAIL_API, DASHBOARD_SUMMARY_API } from '../../common/CommonApiURL';
import { API_SERVICE } from '../../common/CommonMethod';
import { StatCard, SectionCard, EmptyState } from '../../ui';
import QuickActions, { DashboardPage } from './QuickActions';

const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n) || 0);
const compact = (n) => new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(n) || 0);

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

/**
 * Dashboard for Moitech admins (AU) and users (NU). Both read the same two
 * endpoints; admins also get links to reports and masters.
 */
const MoitechDashboard = ({ role = 'NU' }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useMemo(readUser, []);
  const [summary, setSummary] = useState(null);
  const [detail, setDetail] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    const params = { customer_id: user.customerID, function_id: user.functionId, user_type: user.userType, userId: user.id };
    try {
      const [s, d] = await Promise.all([API_SERVICE.get(DASHBOARD_SUMMARY_API, params), API_SERVICE.get(DASHBOARD_DETAIL_API, params)]);
      if (s.data?.result && d.data?.result) {
        setSummary(s.data.data || {});
        setDetail(Array.isArray(d.data.data) ? d.data.data : []);
      } else {
        setError(s.data?.message || d.data?.message || t('errorLoadingDashboard', { defaultValue: 'Could not load the dashboard.' }));
      }
    } catch (err) {
      setError(err?.message || t('errorLoadingDashboard', { defaultValue: 'Could not load the dashboard.' }));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  if (!user) return <Navigate to="/login" replace />;
  if (!user.customerID) return <Navigate to="/unauthorized" replace />;

  const net = (summary?.totalRcdAmount || 0) - (summary?.totalExpenses || 0);
  const colors = { income: theme.palette.primary.main, expense: theme.palette.warning.main };

  const actions = [
    { to: '/transaction', label: t('addTransaction'), description: t('addTransactionHint', { defaultValue: 'Record a moi receipt' }), icon: <AddIcon /> },
    { to: '/transaction-list', label: t('transactionList'), description: t('transactionListHint', { defaultValue: 'Search and edit receipts' }), icon: <ListAltOutlinedIcon />, color: theme.palette.info.main },
    { to: '/addExpenses', label: t('addExpenses'), description: t('addExpensesHint', { defaultValue: 'Record a function expense' }), icon: <PaymentsOutlinedIcon />, color: theme.palette.warning.main },
    role === 'AU'
      ? { to: '/summary-report', label: t('summaryReport'), description: t('summaryReportHint', { defaultValue: 'Totals, PDF and Excel' }), icon: <AssessmentOutlinedIcon />, color: theme.palette.success.main }
      : { to: '/handover', label: t('handOver'), description: t('handOverHint', { defaultValue: 'Hand over cash collected' }), icon: <HandshakeOutlinedIcon />, color: theme.palette.success.main },
  ];

  const tooltipStyle = { borderRadius: 10, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper, color: theme.palette.text.primary, fontSize: 13 };

  return (
    <DashboardPage
      title={t('dashboard')}
      subtitle={user.name ? t('welcomeBackName', { defaultValue: 'Welcome back, {{name}}', name: user.name }) : undefined}
      actions={
        <Button variant="outlined" color="inherit" size="small" startIcon={<RefreshIcon />} onClick={load} disabled={loading}>
          {t('refresh', { defaultValue: 'Refresh' })}
        </Button>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={load}>{t('retry', { defaultValue: 'Retry' })}</Button>}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label={t('dashbordTotalAmount')} value={inr(summary?.totalRcdAmount)} icon={<AccountBalanceWalletOutlinedIcon />} color="primary" loading={loading && !summary} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label={t('dashbordTotalExpenase')} value={inr(summary?.totalExpenses)} icon={<PaymentsOutlinedIcon />} color="warning" loading={loading && !summary} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label={t('dashbordTotalTrans')} value={(summary?.totalRcdTransaction || 0).toLocaleString('en-IN')} icon={<ReceiptLongOutlinedIcon />} color="info" loading={loading && !summary} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard label={t('dashbordTotalPlaces')} value={(summary?.totalPlaces || 0).toLocaleString('en-IN')} icon={<PlaceOutlinedIcon />} color="success" loading={loading && !summary} />
        </Grid>
      </Grid>

      <Typography variant="h5" component="h2" sx={{ mb: 1.5 }}>
        {t('quickActions', { defaultValue: 'Quick actions' })}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <QuickActions actions={actions} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <SectionCard title={t('totalRcdAmountVsTotalExpenses')} subtitle={summary ? `${t('net', { defaultValue: 'Net' })}: ${inr(net)}` : undefined}>
            {loading && !detail.length ? (
              <Skeleton variant="rounded" height={280} />
            ) : detail.length === 0 ? (
              <EmptyState compact title={t('noData')} />
            ) : (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={detail} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.income} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.income} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.expense} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors.expense} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={compact} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={56} />
                    <Tooltip formatter={(v) => inr(v)} contentStyle={tooltipStyle} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                    <Area type="monotone" dataKey="transactions" name={t('totalRcdAmount')} stroke={colors.income} fill="url(#gIncome)" strokeWidth={2} />
                    <Area type="monotone" dataKey="expenses" name={t('totalExpenses')} stroke={colors.expense} fill="url(#gExpense)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <SectionCard title={t('totalRcdNosVsTotalExpenses')}>
            {loading && !detail.length ? (
              <Skeleton variant="rounded" height={280} />
            ) : detail.length === 0 ? (
              <EmptyState compact title={t('noData')} />
            ) : (
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={detail} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.palette.action.hover }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 13 }} />
                    <Bar dataKey="transactionCount" name={t('totalRcdNos')} fill={colors.income} radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenseCount" name={t('totalExpenses')} fill={colors.expense} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {role === 'AU' && (
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button component={RouterLink} to="/purchase" variant="text" endIcon={<AddIcon />}>
            {t('addClient')}
          </Button>
        </Box>
      )}
    </DashboardPage>
  );
};

export default MoitechDashboard;
