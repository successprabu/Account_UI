import { useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Fab,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import BedOutlinedIcon from '@mui/icons-material/BedOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckIcon from '@mui/icons-material/Check';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AppHeader from '../../common/AppHeader';
import PublicFooter from '../../public/PublicFooter';
import { EmptyState, notify } from '../../ui';
import { getPublicMahal, requestBooking, toDay } from '../../../api/mahal';
import { AvailabilityCalendar, EVENT_TYPES, MahalImage, daysBetween, fmtRange, placeLine, rupees } from '../../mahal/shared';
import MahalGallery from '../../mahal/MahalGallery';
import AiChat from '../../mahal/AiChat';

const MAX_DAYS = 7;
const emptyForm = { name: '', phone: '', email: '', eventType: '', guestCount: '', message: '', website: '' };
const waDigits = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};

const Fact = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', flex: 1, minWidth: 140 }}>
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Box>
  </Stack>
);

/** Success panel shown after the request is saved. */
const RequestSent = ({ result, mahal, range, onAnother }) => {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.bookingRef);
      notify.success('Reference copied');
    } catch (e) {
      /* clipboard blocked: the reference is on screen */
    }
  };
  return (
    <Stack component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} alignItems="center" textAlign="center" spacing={2} sx={{ py: 3 }}>
      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 15, delay: 0.1 }}>
        <CheckCircleIcon sx={{ fontSize: 72, color: 'success.main' }} />
      </motion.div>
      <Typography variant="h5" fontWeight={700}>Request sent</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 360 }}>
        {mahal.mahalName} will call you to confirm {fmtRange(range.from, range.to)}. Your booking is confirmed only after the hall accepts it.
      </Typography>
      <Box sx={{ px: 3, py: 1.5, borderRadius: 2, border: '2px dashed', borderColor: 'primary.main' }}>
        <Typography variant="caption" color="text.secondary">Your reference</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h5" fontWeight={800} letterSpacing={2}>{result.bookingRef}</Typography>
          <Tooltip title="Copy">
            <IconButton size="small" onClick={copy} aria-label="Copy reference"><ContentCopyIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      </Box>
      {result.totalAmount > 0 && <Typography variant="body2">Estimated hall rent: <b>{rupees(result.totalAmount)}</b></Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button component={RouterLink} to={`/mahals/status?ref=${result.bookingRef}`} variant="contained">Track my request</Button>
        <Button onClick={onAnother}>Request other dates</Button>
      </Stack>
    </Stack>
  );
};

/** Public: one hall with its free dates and the booking request form. */
const MahalDetails = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(null);
  const [range, setRange] = useState(() => {
    const d = params.get('date');
    if (d && d >= toDay(new Date())) {
      const day = new Date(`${d}T00:00:00`);
      return { from: day, to: day };
    }
    return { from: null, to: null };
  });
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [result, setResult] = useState(null);
  const formRef = useRef(null);
  const narrow = useMediaQuery(theme.breakpoints.down('md'));
  const [formVisible, setFormVisible] = useState(false);

  // On phones the form is below the hall details; offer a button that jumps to it until it is on screen.
  useEffect(() => {
    const el = formRef.current;
    if (!narrow || !el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [narrow, info]);

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      const res = await getPublicMahal(id);
      if (!live) return;
      setLoading(false);
      if (res.ok) setInfo(res.data);
      else setError(res.message);
    })();
    return () => {
      live = false;
    };
  }, [id]);

  const booked = useMemo(() => new Set(info?.bookedDates || []), [info]);
  const requested = useMemo(() => new Set(info?.requestedDates || []), [info]);
  const mahal = info?.mahal;
  const eventChoices = mahal?.eventTypes?.length ? mahal.eventTypes : EVENT_TYPES.map((e) => e.key);

  // First click picks the start; a later click extends the range unless it crosses a booked day.
  const pick = (day) => {
    setSendError('');
    setErrors((er) => ({ ...er, dates: undefined }));
    setRange((r) => {
      if (!r.from || (r.to && toDay(r.to) !== toDay(r.from)) || day < r.from) return { from: day, to: day };
      const days = daysBetween(r.from, day);
      if (days > MAX_DAYS) {
        notify.info(`Online requests can cover up to ${MAX_DAYS} days.`);
        return { from: day, to: day };
      }
      for (let d = new Date(r.from); d <= day; d.setDate(d.getDate() + 1)) {
        if (booked.has(toDay(d))) {
          notify.info('A day in between is already booked.');
          return { from: day, to: day };
        }
      }
      return { from: r.from, to: day };
    });
  };

  const days = range.from ? daysBetween(range.from, range.to || range.from) : 0;
  const estimate = mahal?.pricePerDay > 0 && days ? mahal.pricePerDay * days : 0;
  const pendingOverlap = range.from && [...Array(days).keys()].some((i) => {
    const d = new Date(range.from);
    d.setDate(d.getDate() + i);
    return requested.has(toDay(d));
  });

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!range.from) er.dates = 'Pick your event date on the calendar';
    if (form.name.trim().length < 2) er.name = 'Please enter your name';
    if (!/^[+\d][\d\s-]{8,}$/.test(form.phone.trim()) || form.phone.replace(/\D/g, '').length < 10) er.phone = 'Enter a valid phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) er.email = 'Enter a valid email address';
    if (!form.eventType) er.eventType = 'Choose the event';
    if (form.guestCount && mahal?.capacity && Number(form.guestCount) > mahal.capacity) er.guestCount = `This hall seats up to ${mahal.capacity}`;
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setSendError('');
    const res = await requestBooking({
      mahalId: Number(id),
      ...form,
      guestCount: form.guestCount ? Number(form.guestCount) : null,
      fromDate: toDay(range.from),
      toDate: toDay(range.to || range.from),
    });
    setSending(false);
    if (res.ok) {
      setResult(res.data);
      setInfo((i) => {
        const req = new Set(i.requestedDates);
        for (let k = 0; k < days; k += 1) {
          const d = new Date(range.from);
          d.setDate(d.getDate() + k);
          req.add(toDay(d));
        }
        return { ...i, requestedDates: [...req] };
      });
    } else {
      setSendError(res.message);
    }
  };

  const another = () => {
    setResult(null);
    setRange({ from: null, to: null });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, flex: 1 }}>
        <Button component={RouterLink} to="/mahals" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          All halls
        </Button>

        {loading ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Skeleton variant="rounded" height={320} />
              <Skeleton width="60%" height={44} sx={{ mt: 2 }} />
              <Skeleton width="40%" />
            </Grid>
            <Grid item xs={12} md={5}>
              <Skeleton variant="rounded" height={480} />
            </Grid>
          </Grid>
        ) : error || !mahal ? (
          <Card>
            <EmptyState title="Hall not available" description={error || 'This hall is not taking online bookings.'} action={<Button variant="contained" component={RouterLink} to="/mahals">Browse other halls</Button>} />
          </Card>
        ) : (
          <Grid container spacing={3} alignItems="flex-start">
            <Grid item xs={12} md={7}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                {mahal.photos?.length ? <MahalGallery photos={mahal.photos} name={mahal.mahalName} height={340} /> : <MahalImage mahal={mahal} height={300} radius={4} />}
                <Typography variant="h3" component="h1" sx={{ mt: 3, fontWeight: 800, fontSize: { xs: 26, md: 34 } }}>
                  {mahal.mahalName}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="flex-start" color="text.secondary" sx={{ mt: 1 }}>
                  <PlaceOutlinedIcon fontSize="small" sx={{ mt: 0.25 }} />
                  <Typography>{[mahal.addressLine1, mahal.addressLine2, placeLine(mahal), mahal.pincode].filter(Boolean).join(', ')}</Typography>
                </Stack>

                <Stack direction="row" spacing={1.5} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
                  {mahal.capacity > 0 && <Fact icon={<GroupsOutlinedIcon />} label="Seating" value={`${mahal.capacity.toLocaleString('en-IN')} guests`} />}
                  {mahal.diningCapacity > 0 && <Fact icon={<RestaurantOutlinedIcon />} label="Dining" value={`${mahal.diningCapacity.toLocaleString('en-IN')} at a time`} />}
                  {mahal.roomCount > 0 && <Fact icon={<BedOutlinedIcon />} label="Rooms" value={mahal.roomCount} />}
                  {mahal.pricePerDay > 0 && <Fact icon={<Typography fontWeight={800}>₹</Typography>} label="Hall rent" value={`${rupees(mahal.pricePerDay)} / day`} />}
                </Stack>

                {mahal.description && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>About the hall</Typography>
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{mahal.description}</Typography>
                  </Box>
                )}

                {mahal.amenities?.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Facilities</Typography>
                    <Grid container spacing={1}>
                      {mahal.amenities.map((a, i) => (
                        <Grid item xs={12} sm={6} key={a}>
                          <Stack component={motion.div} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.04 }} direction="row" spacing={1} alignItems="center">
                            <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
                            <Typography>{a}</Typography>
                          </Stack>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {mahal.eventTypes?.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Events hosted</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {mahal.eventTypes.map((e) => <Chip key={e} label={e} />)}
                    </Stack>
                  </Box>
                )}

                {info.contactNumber && (
                  <Card variant="outlined" sx={{ mt: 4, p: 2.5 }}>
                    <Typography fontWeight={700}>Prefer to talk?</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {info.contactPerson ? `${info.contactPerson} · ` : ''}{info.contactNumber}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" startIcon={<PhoneOutlinedIcon />} href={`tel:${info.contactNumber}`}>Call</Button>
                      <Button variant="outlined" color="success" startIcon={<WhatsAppIcon />} href={`https://wa.me/${waDigits(info.contactNumber)}?text=${encodeURIComponent(`Hello, I would like to book ${mahal.mahalName}.`)}`} target="_blank" rel="noopener noreferrer">
                        WhatsApp
                      </Button>
                    </Stack>
                  </Card>
                )}
              </motion.div>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card ref={formRef} id="book" component={motion.div} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} sx={{ p: { xs: 2, md: 3 }, position: { md: 'sticky' }, top: { md: 88 }, boxShadow: theme.shadows[6] }}>
                <AnimatePresence mode="wait">
                  {result ? (
                    <RequestSent key="done" result={result} mahal={mahal} range={range} onAnother={another} />
                  ) : (
                    <Box key="form" component="form" noValidate onSubmit={submit}>
                      <Typography variant="h6" fontWeight={700}>Request a booking</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Pick a date, or click a second date for a multi-day event.
                      </Typography>

                      <AvailabilityCalendar booked={booked} requested={requested} value={range} onSelect={pick} minDate={new Date()} compact />
                      {errors.dates && <Typography color="error" variant="body2" sx={{ mt: 1 }}>{errors.dates}</Typography>}

                      <AnimatePresence>
                        {range.from && (
                          <Box component={motion.div} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} sx={{ overflow: 'hidden' }}>
                            <Box sx={{ mt: 2, p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
                              <Stack direction="row" justifyContent="space-between">
                                <Typography fontWeight={700}>{fmtRange(range.from, range.to)}</Typography>
                                <Typography color="text.secondary">{days} {days === 1 ? 'day' : 'days'}</Typography>
                              </Stack>
                              {estimate > 0 && (
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                  Estimated rent <b>{rupees(estimate)}</b>
                                  {mahal.advanceAmount > 0 && <> · advance {rupees(mahal.advanceAmount)} to confirm</>}
                                </Typography>
                              )}
                            </Box>
                            {pendingOverlap && (
                              <Alert severity="warning" sx={{ mt: 1.5 }}>Someone has already asked for one of these days. You can still send a request; the hall decides.</Alert>
                            )}
                          </Box>
                        )}
                      </AnimatePresence>

                      <Divider sx={{ my: 2.5 }} />

                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Event</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: errors.eventType ? 0.5 : 2 }}>
                        {eventChoices.map((e) => (
                          <Chip
                            key={e}
                            label={e}
                            clickable
                            onClick={() => {
                              setForm((f) => ({ ...f, eventType: e }));
                              setErrors((er) => ({ ...er, eventType: undefined }));
                            }}
                            color={form.eventType === e ? 'primary' : 'default'}
                            variant={form.eventType === e ? 'filled' : 'outlined'}
                            aria-pressed={form.eventType === e}
                          />
                        ))}
                      </Stack>
                      {errors.eventType && <Typography color="error" variant="caption" display="block" sx={{ mb: 2 }}>{errors.eventType}</Typography>}

                      <Stack spacing={2}>
                        <TextField label="Your name" required value={form.name} onChange={set('name')} error={!!errors.name} helperText={errors.name} autoComplete="name" />
                        <Stack direction="row" spacing={2}>
                          <TextField label="Phone" required fullWidth value={form.phone} onChange={set('phone')} error={!!errors.phone} helperText={errors.phone} type="tel" autoComplete="tel" />
                          <TextField label="Guests" sx={{ width: 140 }} value={form.guestCount} onChange={(e) => set('guestCount')({ target: { value: e.target.value.replace(/\D/g, '').slice(0, 6) } })} error={!!errors.guestCount} helperText={errors.guestCount} inputProps={{ inputMode: 'numeric' }} />
                        </Stack>
                        <TextField label="Email (optional)" value={form.email} onChange={set('email')} error={!!errors.email} helperText={errors.email} type="email" autoComplete="email" />
                        <TextField label="Anything the hall should know? (optional)" value={form.message} onChange={set('message')} multiline minRows={2} inputProps={{ maxLength: 1000 }} />
                        {/* Honeypot: hidden from people, filled by bots. */}
                        <Box sx={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden>
                          <label htmlFor="mahal-website">Website</label>
                          <input id="mahal-website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                        </Box>
                        {sendError && <Alert severity="error">{sendError}</Alert>}
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          disabled={sending}
                          component={motion.button}
                          whileTap={{ scale: 0.97 }}
                          startIcon={sending ? <CircularProgress size={18} color="inherit" /> : <SendOutlinedIcon />}
                        >
                          {sending ? 'Sending…' : 'Send booking request'}
                        </Button>
                        <Typography variant="caption" color="text.secondary" textAlign="center">
                          No payment now. The hall calls you to confirm and collect the advance.
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                </AnimatePresence>
              </Card>
            </Grid>
          </Grid>
        )}
      </Container>
      <PublicFooter />
      {mahal && <AiChat mahalId={mahal.id} hallName={mahal.mahalName} bottomOffset={narrow && !formVisible && !result ? 72 : 0} />}
      <AnimatePresence>
        {narrow && mahal && !formVisible && !result && (
          <Box component={motion.div} initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} sx={{ position: 'fixed', left: 16, right: 16, bottom: 16, zIndex: 10 }}>
            <Fab variant="extended" color="primary" sx={{ width: '100%' }} onClick={() => formRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })}>
              <EventAvailableOutlinedIcon sx={{ mr: 1 }} />
              Check dates &amp; book
            </Fab>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default MahalDetails;
