import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Chip,
  Container,
  Grid,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AppHeader from '../../common/AppHeader';
import PublicFooter from '../../public/PublicFooter';
import { EmptyState } from '../../ui';
import { searchMahals, toDay } from '../../../api/mahal';
import { EVENT_TYPES, MahalImage, fadeUp, placeLine, rupees } from '../../mahal/shared';
import AiChat from '../../mahal/AiChat';

const MotionCard = motion(Card);

const MahalCard = ({ mahal, index, date }) => {
  const theme = useTheme();
  const to = `/mahals/${mahal.id}${date ? `?date=${date}` : ''}`;
  return (
    <MotionCard
      className="mahal-card"
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, scale: 0.97 }}
      layout
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      sx={{ height: '100%', overflow: 'hidden', '&:hover': { boxShadow: theme.shadows[8] } }}
    >
      <CardActionArea component={RouterLink} to={to} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <MahalImage mahal={mahal} height={180}>
          {mahal.availableOnDate !== null && mahal.availableOnDate !== undefined && (
            <Chip
              size="small"
              icon={mahal.availableOnDate ? <EventAvailableOutlinedIcon /> : <EventBusyOutlinedIcon />}
              label={mahal.availableOnDate ? 'Available' : 'Booked'}
              color={mahal.availableOnDate ? 'success' : 'default'}
              sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 600, bgcolor: mahal.availableOnDate ? undefined : 'rgba(15,23,42,.75)', color: mahal.availableOnDate ? undefined : '#fff', '& .MuiChip-icon': { color: 'inherit' } }}
            />
          )}
          {mahal.pricePerDay > 0 && (
            <Box sx={{ position: 'absolute', bottom: 12, right: 12, px: 1.25, py: 0.5, borderRadius: 2, bgcolor: 'rgba(15,23,42,.78)', color: '#fff', backdropFilter: 'blur(4px)' }}>
              <Typography component="span" fontWeight={700}>{rupees(mahal.pricePerDay)}</Typography>
              <Typography component="span" variant="caption" sx={{ opacity: 0.8 }}> / day</Typography>
            </Box>
          )}
        </MahalImage>
        <Box sx={{ p: 2.25, flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6" component="h3" fontWeight={700} noWrap title={mahal.mahalName}>
            {mahal.mahalName}
          </Typography>
          {placeLine(mahal) && (
            <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
              <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2" noWrap>{placeLine(mahal)}</Typography>
            </Stack>
          )}
          {mahal.capacity > 0 && (
            <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary">
              <GroupsOutlinedIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">Up to {mahal.capacity.toLocaleString('en-IN')} guests</Typography>
            </Stack>
          )}
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 'auto', pt: 1 }}>
            {(mahal.eventTypes || []).slice(0, 3).map((e) => (
              <Chip key={e} label={e} size="small" variant="outlined" sx={{ borderColor: alpha(theme.palette.primary.main, 0.3) }} />
            ))}
            {(mahal.eventTypes || []).length > 3 && <Chip label={`+${mahal.eventTypes.length - 3}`} size="small" />}
          </Stack>
        </Box>
      </CardActionArea>
    </MotionCard>
  );
};

/** Public: search halls that take online bookings, filter by event, date, guests and place. */
const FindMahal = () => {
  const theme = useTheme();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [eventType, setEventType] = useState(params.get('event') || '');
  const [date, setDate] = useState(params.get('date') || '');
  const [guests, setGuests] = useState(params.get('guests') || '');
  const [district, setDistrict] = useState(params.get('district') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mahals, setMahals] = useState([]);
  const [places, setPlaces] = useState([]);

  const run = useCallback(async (f) => {
    setLoading(true);
    setError('');
    const res = await searchMahals({
      q: f.q || undefined,
      eventType: f.eventType || undefined,
      date: f.date || undefined,
      guests: f.guests || undefined,
      district: f.district || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      setMahals([]);
      return;
    }
    const list = res.data || [];
    // Available halls first when a date is chosen.
    if (f.date) list.sort((a, b) => Number(b.availableOnDate) - Number(a.availableOnDate));
    setMahals(list);
    if (!f.district) {
      const seen = new Map();
      list.forEach((m) => m.district && m.districtName && seen.set(String(m.district), m.districtName));
      setPlaces([...seen.entries()].sort((a, b) => a[1].localeCompare(b[1])));
    }
  }, []);

  const filters = useMemo(() => ({ q, eventType, date, guests, district }), [q, eventType, date, guests, district]);

  // Search as the visitor types or picks, with a short pause for typing.
  useEffect(() => {
    const id = setTimeout(() => {
      run(filters);
      const next = {};
      if (filters.q) next.q = filters.q;
      if (filters.eventType) next.event = filters.eventType;
      if (filters.date) next.date = filters.date;
      if (filters.guests) next.guests = filters.guests;
      if (filters.district) next.district = filters.district;
      setParams(next, { replace: true });
    }, 350);
    return () => clearTimeout(id);
  }, [filters, run, setParams]);

  const clear = () => {
    setQ('');
    setEventType('');
    setDate('');
    setGuests('');
    setDistrict('');
  };
  const hasFilters = q || eventType || date || guests || district;
  const available = date ? mahals.filter((m) => m.availableOnDate).length : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Hero */}
      <Box sx={{ position: 'relative', overflow: 'hidden', background: 'var(--ms-gradient, linear-gradient(135deg,#6366f1,#db2777))', color: '#fff', pt: { xs: 6, md: 9 }, pb: { xs: 12, md: 14 } }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            component={motion.div}
            aria-hidden
            animate={{ y: [0, -18, 0], x: [0, 10, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            sx={{ position: 'absolute', borderRadius: '50%', bgcolor: 'rgba(255,255,255,.12)', width: [220, 140, 320][i], height: [220, 140, 320][i], top: ['-60px', '40%', '10%'][i], left: ['-40px', '70%', '85%'][i] }}
          />
        ))}
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: 2 }}>Online mahal booking</Typography>
            <Typography variant="h2" component="h1" sx={{ color: '#fff', fontWeight: 800, fontSize: { xs: 32, md: 48 }, maxWidth: 720, lineHeight: 1.1 }}>
              Find the perfect hall for your celebration
            </Typography>
            <Typography sx={{ mt: 1.5, opacity: 0.9, fontSize: { xs: 16, md: 18 }, maxWidth: 620 }}>
              Marriages, receptions, birthdays and more. Check free dates, compare halls and send a booking request in minutes.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Search panel floating over the hero */}
      <Container maxWidth="lg" sx={{ mt: { xs: -9, md: -10 }, position: 'relative', zIndex: 1 }}>
        <Card component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} sx={{ p: { xs: 2, md: 3 }, boxShadow: theme.shadows[10] }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Hall, area or pincode"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth type="date" label="Event date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} inputProps={{ min: toDay(new Date()) }} />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField fullWidth type="number" label="Guests" value={guests} onChange={(e) => setGuests(e.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ min: 1, inputMode: 'numeric' }} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" size="large" sx={{ height: '100%', minHeight: 56 }} onClick={() => run(filters)} startIcon={<SearchIcon />}>
                Search
              </Button>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', pb: 0.5 }} role="group" aria-label="Event type">
            {EVENT_TYPES.filter((e) => e.key !== 'Other').map((e) => {
              const on = eventType === e.key;
              return (
                <Chip
                  key={e.key}
                  component={motion.div}
                  whileTap={{ scale: 0.94 }}
                  icon={e.icon}
                  label={e.key}
                  clickable
                  onClick={() => setEventType(on ? '' : e.key)}
                  aria-pressed={on}
                  variant={on ? 'filled' : 'outlined'}
                  sx={{
                    flexShrink: 0,
                    fontWeight: 600,
                    ...(on ? { bgcolor: e.color, color: '#fff', '& .MuiChip-icon': { color: '#fff' }, '&:hover': { bgcolor: e.color } } : { '& .MuiChip-icon': { color: e.color } }),
                  }}
                />
              );
            })}
          </Stack>
        </Card>
      </Container>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 5 }, flex: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mb: 2.5 }}>
          <Box>
            <Typography variant="h5" component="h2" fontWeight={700}>
              {loading ? 'Searching…' : `${mahals.length} ${mahals.length === 1 ? 'hall' : 'halls'}`}
              {!loading && available !== null && (
                <Typography component="span" color="success.main" fontWeight={600}> · {available} free on {new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</Typography>
              )}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {hasFilters && <Button onClick={clear}>Clear filters</Button>}
            <Button component={RouterLink} to="/mahals/status" variant="outlined" startIcon={<ReceiptLongOutlinedIcon />}>
              Check my booking
            </Button>
          </Stack>
        </Stack>

        {places.length > 1 && (
          <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 0.5 }} role="group" aria-label="District">
            <Chip label="All places" onClick={() => setDistrict('')} color={!district ? 'primary' : 'default'} variant={!district ? 'filled' : 'outlined'} />
            {places.map(([id, name]) => (
              <Chip key={id} icon={<PlaceOutlinedIcon />} label={name} onClick={() => setDistrict(district === id ? '' : id)} color={district === id ? 'primary' : 'default'} variant={district === id ? 'filled' : 'outlined'} sx={{ flexShrink: 0 }} />
            ))}
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" onClick={() => run(filters)}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Card sx={{ overflow: 'hidden' }}>
                  <Skeleton variant="rectangular" height={180} />
                  <Box sx={{ p: 2.25 }}>
                    <Skeleton width="70%" height={28} />
                    <Skeleton width="50%" />
                    <Skeleton width="40%" />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : mahals.length === 0 && !error ? (
          <Card>
            <EmptyState
              icon={<ManageSearchIcon />}
              title="No halls match your search"
              description={hasFilters ? 'Try another date, fewer guests or a different area.' : 'No halls are taking online bookings yet. Please check back soon.'}
              action={hasFilters ? <Button variant="contained" onClick={clear}>Clear filters</Button> : undefined}
            />
          </Card>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence mode="popLayout">
              {mahals.map((m, i) => (
                <Grid item xs={12} sm={6} md={4} key={m.id}>
                  <MahalCard mahal={m} index={i} date={date} />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}
      </Container>

      <PublicFooter />
      <AiChat />
    </Box>
  );
};

export default FindMahal;
