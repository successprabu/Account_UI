import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Alert, Avatar, Box, Button, Card, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip as ChartTooltip, XAxis, YAxis } from 'recharts';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import MarkEmailUnreadOutlinedIcon from '@mui/icons-material/MarkEmailUnreadOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AddIcon from '@mui/icons-material/Add';
import PublicIcon from '@mui/icons-material/Public';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import { EmptyState } from '../ui';
import { DashboardPage } from './dashboard/QuickActions';
import { getMahalSummary, toDay } from '../../api/mahal';
import { eventMeta, fadeUp, fmtRange, rupees } from '../mahal/shared';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

/** Counts up to the value when it first appears. */
const CountUp = ({ value, format = (v) => Math.round(v).toLocaleString('en-IN') }) => {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => format(v));
  useEffect(() => {
    const controls = animate(mv, Number(value) || 0, { duration: 0.9, ease: 'easeOut' });
    return controls.stop;
  }, [mv, value]);
  return <motion.span>{text}</motion.span>;
};

const Stat = ({ label, value, icon, color, format, to, hint, index, loading, pulse }) => {
  const theme = useTheme();
  const main = theme.palette[color]?.main || theme.palette.primary.main;
  const body = (
    <Card component={motion.div} variants={fadeUp} custom={index} initial="hidden" animate="show" whileHover={to ? { y: -4 } : undefined} sx={{ p: 2.5, height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box aria-hidden sx={{ position: 'absolute', right: -24, top: -24, width: 96, height: 96, borderRadius: '50%', bgcolor: alpha(main, 0.08) }} />
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          component={motion.div}
          animate={pulse ? { scale: [1, 1.12, 1] } : undefined}
          transition={pulse ? { duration: 1.6, repeat: Infinity } : undefined}
          sx={{ width: 44, height: 44, borderRadius: 2, display: 'grid', placeItems: 'center', color: main, bgcolor: alpha(main, 0.12), flexShrink: 0 }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
          {loading ? <Skeleton width={80} height={36} /> : (
            <Typography variant="h4" component="p" fontWeight={800} sx={{ mt: 0.25, fontVariantNumeric: 'tabular-nums' }}>
              <CountUp value={value} format={format} />
            </Typography>
          )}
          {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
        </Box>
      </Stack>
    </Card>
  );
  return to ? <Box component={RouterLink} to={to} sx={{ textDecoration: 'none', display: 'block', height: '100%' }}>{body}</Box> : body;
};

const BookingLine = ({ b, index }) => {
  const meta = eventMeta(b.eventType);
  return (
    <Stack component={motion.div} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + index * 0.05 }} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25 }}>
      <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(meta.color, 0.14), color: meta.color, '& svg': { fontSize: 20 } }}>{meta.icon}</Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={600} noWrap>{b.customerName}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>{b.eventType || 'Event'} · {fmtRange(b.fromDate, b.toDate)}{b.mahalName ? ` · ${b.mahalName}` : ''}</Typography>
      </Box>
      {b.balance > 0 && <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{rupees(b.balance)} due</Typography>}
    </Stack>
  );
};

const ChartTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <Card sx={{ px: 1.5, py: 1, boxShadow: 6 }}>
      <Typography variant="body2" fontWeight={700}>{p.label}</Typography>
      <Typography variant="body2">{p.count} {p.count === 1 ? 'booking' : 'bookings'}</Typography>
      <Typography variant="caption" color="text.secondary">{rupees(p.amount)} rent</Typography>
    </Card>
  );
};

/** Mahal admin dashboard: live figures, requests to act on and upcoming events. */
const DashboardMahal = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useMemo(readUser, []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [s, setS] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await getMahalSummary();
    setLoading(false);
    if (res.ok) setS(res.data);
    else setError(res.message);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const thisMonth = toDay(new Date()).slice(0, 7);
  const chart = useMemo(() => (s?.months || []).map((m) => ({
    ...m,
    short: new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'short' }),
    label: new Date(`${m.month}-01T00:00:00`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    current: m.month === thisMonth,
  })), [s, thisMonth]);

  const noMahals = !loading && s && s.mahalCount === 0;
  const money = (v) => rupees(v);

  return (
    <DashboardPage
      title={t('dashboard')}
      subtitle={user?.name ? t('welcomeBackName', { defaultValue: 'Welcome back, {{name}}', name: user.name }) : undefined}
      actions={
        <>
          <Button component={RouterLink} to="/mahals" target="_blank" startIcon={<PublicIcon />}>Booking site</Button>
          <Button component={RouterLink} to="/mahal-bookings?new=1" variant="contained" startIcon={<AddIcon />} disabled={noMahals}>New booking</Button>
        </>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" startIcon={<RefreshIcon />} onClick={load}>Retry</Button>}>{error}</Alert>}

      {noMahals ? (
        <Card component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <EmptyState
            icon={<ApartmentOutlinedIcon />}
            title="Add your mahal to start taking bookings"
            description="Enter your hall's capacity, rent and facilities, and turn on online booking. Customers can then find it, check free dates and send requests."
            action={<Button variant="contained" component={RouterLink} to="/my-mahals?new=1" startIcon={<AddIcon />}>Add mahal</Button>}
          />
        </Card>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={6} lg={3}><Stat index={0} loading={loading} label="New requests" value={s?.pendingRequests} icon={<MarkEmailUnreadOutlinedIcon />} color="warning" to="/mahal-bookings?tab=Pending" hint="Waiting for your answer" pulse={s?.pendingRequests > 0} /></Grid>
            <Grid item xs={6} lg={3}><Stat index={1} loading={loading} label="Upcoming events" value={s?.upcomingEvents} icon={<EventAvailableOutlinedIcon />} color="primary" to="/mahal-bookings" hint="Confirmed bookings ahead" /></Grid>
            <Grid item xs={6} lg={3}><Stat index={2} loading={loading} label="This month's rent" value={s?.monthRevenue} format={money} icon={<CurrencyRupeeIcon />} color="success" hint={`${s?.monthBookings ?? 0} bookings this month`} /></Grid>
            <Grid item xs={6} lg={3}><Stat index={3} loading={loading} label="Balance to collect" value={s?.balanceDue} format={money} icon={<AccountBalanceWalletOutlinedIcon />} color="info" hint="From confirmed bookings" /></Grid>
          </Grid>

          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={7}>
              <Card component={motion.div} variants={fadeUp} custom={4} initial="hidden" animate="show" sx={{ p: 2.5, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Bookings per month</Typography>
                    <Typography variant="body2" color="text.secondary">Confirmed and completed, last 6 months and next 6</Typography>
                  </Box>
                </Stack>
                {loading ? <Skeleton variant="rounded" height={260} /> : (
                  <Box sx={{ height: 260 }} role="img" aria-label={`Bookings per month: ${chart.map((c) => `${c.label} ${c.count}`).join(', ')}`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chart} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid vertical={false} stroke={theme.palette.divider} strokeDasharray="0" />
                        <XAxis dataKey="short" tickLine={false} axisLine={{ stroke: theme.palette.divider }} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                        <ChartTooltip content={<ChartTip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }} />
                        <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={900} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Card>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card component={motion.div} variants={fadeUp} custom={5} initial="hidden" animate="show" sx={{ p: 2.5, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700}>Requests to answer</Typography>
                  <Button size="small" component={RouterLink} to="/mahal-bookings?tab=Pending" endIcon={<ArrowForwardIcon />}>All</Button>
                </Stack>
                {loading ? <Stack spacing={1} sx={{ mt: 1 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={52} />)}</Stack>
                  : s?.pending?.length ? s.pending.map((b, i) => <BookingLine key={b.id} b={b} index={i} />)
                    : <EmptyState compact title="All caught up" description={s?.onlineCount ? 'New requests from the booking site will appear here.' : 'Turn on online booking for a mahal to get requests.'} />}
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card component={motion.div} variants={fadeUp} custom={6} initial="hidden" animate="show" sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={700}>Coming up</Typography>
                  <Button size="small" component={RouterLink} to="/mahal-bookings" endIcon={<ArrowForwardIcon />}>All bookings</Button>
                </Stack>
                {loading ? <Stack spacing={1} sx={{ mt: 1 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={52} />)}</Stack>
                  : s?.upcoming?.length ? (
                    <Grid container columnSpacing={4}>
                      {s.upcoming.map((b, i) => <Grid item xs={12} md={6} key={b.id}><BookingLine b={b} index={i} /></Grid>)}
                    </Grid>
                  ) : <EmptyState compact title="No upcoming events" description="Confirmed bookings will show here." />}
              </Card>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
            <Button component={RouterLink} to="/my-mahals" startIcon={<ApartmentOutlinedIcon />}>My mahals ({s?.mahalCount ?? 0})</Button>
            <Button component={RouterLink} to="/add-moitech-customer">{t('addMoiTechCustomer')}</Button>
            <Button component={RouterLink} to="/settings">{t('Theme Settings', { defaultValue: 'Theme settings' })}</Button>
          </Stack>
        </>
      )}
    </DashboardPage>
  );
};

export default DashboardMahal;
