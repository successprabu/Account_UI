import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import PublicIcon from '@mui/icons-material/Public';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { EmptyState, PageHeader, StatusChip, notify } from '../../ui';
import { getBooking, listBookings, listMyMahals, recordPayment, saveBooking, setBookingStatus, toDay, toLocalIso } from '../../../api/mahal';
import { AiQuickBooking, FollowUpsPanel, draftToForm, useAiEnabled } from '../../mahal/AiBooking';
import { listFollowUps } from '../../../api/mahalAi';
import { AvailabilityCalendar, EVENT_TYPES, STATUS, effectiveStatus, eventMeta, fadeUp, fmtDate, fmtRange, rupees } from '../../mahal/shared';

const TABS = [
  { key: 'Pending', label: 'Requests' },
  { key: 'Upcoming', label: 'Upcoming' },
  { key: 'Completed', label: 'Completed' },
  { key: 'Cancelled', label: 'Cancelled' },
  { key: '', label: 'All', count: 'All' },
];
const PAY_METHODS = ['Cash', 'UPI', 'Bank transfer', 'Card', 'Cheque'];
const PAGE = 20;
const waDigits = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};
const inputValue = (d) => (d ? toLocalIso(d).slice(0, 16) : '');

const StatusBadge = ({ booking }) => {
  const s = effectiveStatus(booking);
  return <StatusChip label={STATUS[s]?.label || s} tone={STATUS[s]?.tone || 'neutral'} />;
};

// ---------------------------------------------------------------- add / edit

const emptyBooking = (mahalId) => {
  const from = new Date();
  from.setDate(from.getDate() + 1);
  from.setHours(6, 0, 0, 0);
  const to = new Date(from);
  to.setHours(22, 0, 0, 0);
  return { id: 0, mahalId: mahalId || '', customerName: '', primary_phone: '', email: '', eventType: 'Marriage', guestCount: '', fromDate: inputValue(from), toDate: inputValue(to), totalAmount: '', discount: '', advance: '', payMethod: 'Cash', remarks: '' };
};

const BookingFormDialog = ({ open, booking, draft, mahals, defaultMahal, onClose, onSaved }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState(emptyBooking());
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaveError('');
    if (booking) {
      setForm({
        ...booking,
        email: booking.email || '',
        eventType: booking.eventType || 'Other',
        guestCount: booking.guestCount || '',
        fromDate: inputValue(new Date(booking.fromDate)),
        toDate: inputValue(new Date(booking.toDate)),
        totalAmount: booking.totalAmount || '',
        discount: booking.discount || '',
        advance: booking.advance || '',
        payMethod: booking.payMethod || 'Cash',
        remarks: booking.remarks || '',
      });
    } else if (draft) {
      // Filled by AI from the owner's words: show what is still missing.
      setForm({ ...emptyBooking(defaultMahal || (mahals.length === 1 ? mahals[0].id : '')), ...draftToForm(draft) });
      const er = {};
      (draft.missing || []).forEach((m) => {
        if (m === 'hall') er.mahalId = 'Choose the hall';
        if (m === 'customer name') er.customerName = 'Not in your note: please type it';
        if (m === 'phone') er.primary_phone = 'Not in your note: please type it';
        if (m === 'date') er.fromDate = 'Not in your note: please choose';
      });
      setErrors(er);
    } else {
      setForm(emptyBooking(defaultMahal || (mahals.length === 1 ? mahals[0].id : '')));
    }
  }, [open, booking, draft, defaultMahal, mahals]);

  const mahal = mahals.find((m) => m.id === Number(form.mahalId));
  const set = (k, transform) => (e) => {
    const value = transform ? transform(e) : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };
  const money = (e) => e.target.value.replace(/[^\d.]/g, '').slice(0, 10);

  // Suggest the rent from the hall's daily price when the owner has not typed one.
  useEffect(() => {
    if (!open || booking || !mahal?.pricePerDay || form.totalAmount) return;
    const days = Math.max(1, Math.ceil((new Date(form.toDate) - new Date(form.fromDate)) / 86400000));
    setForm((f) => ({ ...f, totalAmount: String(mahal.pricePerDay * days), advance: f.advance || (mahal.advanceAmount ? String(mahal.advanceAmount) : '') }));
  }, [open, booking, mahal, form.fromDate, form.toDate, form.totalAmount]);

  const balance = Math.max(0, (Number(form.totalAmount) || 0) - (Number(form.discount) || 0) - (Number(form.advance) || 0) - (Number(booking?.rcdAmount) || 0));

  const validate = () => {
    const er = {};
    if (!form.mahalId) er.mahalId = 'Choose the hall';
    if (form.customerName.trim().length < 2) er.customerName = 'Enter the customer name';
    if (form.primary_phone.replace(/\D/g, '').length < 10) er.primary_phone = 'Enter a valid phone number';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) er.email = 'Enter a valid email';
    if (!form.fromDate) er.fromDate = 'Choose the start';
    if (!form.toDate || new Date(form.toDate) <= new Date(form.fromDate)) er.toDate = 'Must be after the start';
    if ((Number(form.discount) || 0) > (Number(form.totalAmount) || 0)) er.discount = 'More than the total';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');
    const res = await saveBooking({
      id: form.id,
      mahalId: Number(form.mahalId),
      customerName: form.customerName,
      primary_phone: form.primary_phone,
      email: form.email || null,
      eventType: form.eventType,
      guestCount: form.guestCount ? Number(form.guestCount) : null,
      fromDate: `${form.fromDate}:00`,
      toDate: `${form.toDate}:00`,
      totalAmount: Number(form.totalAmount) || 0,
      discount: Number(form.discount) || 0,
      advance: Number(form.advance) || 0,
      payMethod: form.payMethod,
      remarks: form.remarks,
    });
    setSaving(false);
    if (res.ok) {
      notify.success(res.message || 'Saved');
      onSaved(res.data);
    } else setSaveError(res.message);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullScreen={fullScreen} maxWidth="md" fullWidth scroll="paper" PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle sx={{ pr: 6 }}>
        {form.id ? `Edit booking ${booking?.bookingRef || ''}` : 'New booking'}
        <IconButton onClick={onClose} disabled={saving} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5} useFlexGap>
          {draft && !booking && (
            <Alert severity="info" icon={<AutoAwesomeIcon />} component={motion.div} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              Filled by AI from your note. Please check every detail before saving.{draft.note ? ` ${draft.note}` : ''}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth select required label="Mahal" value={form.mahalId} onChange={set('mahalId')} error={!!errors.mahalId} helperText={errors.mahalId}>
                {mahals.map((m) => <MenuItem key={m.id} value={m.id}>{m.mahalName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6} md={3}><TextField fullWidth type="datetime-local" label="From" value={form.fromDate} onChange={set('fromDate')} InputLabelProps={{ shrink: true }} error={!!errors.fromDate} helperText={errors.fromDate} /></Grid>
            <Grid item xs={6} md={3}><TextField fullWidth type="datetime-local" label="To" value={form.toDate} onChange={set('toDate')} InputLabelProps={{ shrink: true }} error={!!errors.toDate} helperText={errors.toDate} /></Grid>
          </Grid>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Event</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {EVENT_TYPES.map((ev) => (
                <Chip key={ev.key} icon={ev.icon} label={ev.key} clickable onClick={() => setForm((f) => ({ ...f, eventType: ev.key }))} color={form.eventType === ev.key ? 'primary' : 'default'} variant={form.eventType === ev.key ? 'filled' : 'outlined'} aria-pressed={form.eventType === ev.key} />
              ))}
            </Stack>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth required label="Customer name" value={form.customerName} onChange={set('customerName')} error={!!errors.customerName} helperText={errors.customerName} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth required label="Phone" type="tel" value={form.primary_phone} onChange={set('primary_phone')} error={!!errors.primary_phone} helperText={errors.primary_phone} /></Grid>
            <Grid item xs={12} md={8}><TextField fullWidth label="Email" value={form.email} onChange={set('email')} error={!!errors.email} helperText={errors.email} /></Grid>
            <Grid item xs={12} md={4}><TextField fullWidth label="Guests" value={form.guestCount} onChange={set('guestCount', (e) => e.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ inputMode: 'numeric' }} /></Grid>
          </Grid>

          <Divider textAlign="left"><Typography variant="overline">Payment</Typography></Divider>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}><TextField fullWidth label="Hall rent" value={form.totalAmount} onChange={set('totalAmount', money)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} /></Grid>
            <Grid item xs={6} md={3}><TextField fullWidth label="Discount" value={form.discount} onChange={set('discount', money)} error={!!errors.discount} helperText={errors.discount} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} /></Grid>
            <Grid item xs={6} md={3}><TextField fullWidth label="Advance received" value={form.advance} onChange={set('advance', money)} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} /></Grid>
            <Grid item xs={6} md={3}>
              <TextField fullWidth select label="Paid by" value={form.payMethod} onChange={set('payMethod')}>
                {PAY_METHODS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08) }}>
            <Typography color="text.secondary">Balance due{booking?.rcdAmount > 0 ? ` (after ${rupees(booking.rcdAmount)} already received)` : ''}</Typography>
            <Typography variant="h6" fontWeight={800} component={motion.p} key={balance} initial={{ scale: 1.15 }} animate={{ scale: 1 }}>{rupees(balance)}</Typography>
          </Stack>
          <TextField fullWidth multiline minRows={2} label="Notes" value={form.remarks} onChange={set('remarks')} inputProps={{ maxLength: 1000 }} />
          {saveError && <Alert severity="error">{saveError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}>
          {saving ? 'Saving…' : form.id ? 'Save changes' : 'Save booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ---------------------------------------------------------------- detail drawer

const Line = ({ label, children }) => (
  <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.75 }}>
    <Typography color="text.secondary" variant="body2">{label}</Typography>
    <Typography variant="body2" fontWeight={600} textAlign="right">{children}</Typography>
  </Stack>
);

const ReasonDialog = ({ open, title, label, confirmText, onClose, onConfirm, busy }) => {
  const [reason, setReason] = useState('');
  useEffect(() => {
    if (open) setReason('');
  }, [open]);
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField autoFocus fullWidth multiline minRows={2} label={label} value={reason} onChange={(e) => setReason(e.target.value)} helperText="The customer sees this when they check their booking." sx={{ mt: 1 }} inputProps={{ maxLength: 300 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Back</Button>
        <Button color="error" variant="contained" disabled={busy || reason.trim().length < 3} onClick={() => onConfirm(reason.trim())}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};

const PaymentDialog = ({ open, booking, onClose, onDone }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (open) {
      setAmount(booking?.balance ? String(booking.balance) : '');
      setErr('');
    }
  }, [open, booking]);
  const save = async () => {
    setBusy(true);
    const res = await recordPayment(booking.id, Number(amount), method);
    setBusy(false);
    if (res.ok) {
      notify.success('Payment recorded');
      onDone(res.data);
    } else setErr(res.message);
  };
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Record payment</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Balance due: <b>{rupees(booking?.balance)}</b></Typography>
        <Stack spacing={2}>
          <TextField autoFocus label="Amount received" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} />
          <TextField select label="Paid by" value={method} onChange={(e) => setMethod(e.target.value)}>
            {PAY_METHODS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
          {err && <Alert severity="error">{err}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" disabled={busy || !(Number(amount) > 0)} onClick={save}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

const BookingDrawer = ({ id, reloadKey, onClose, onChanged, onEdit }) => {
  const theme = useTheme();
  const narrow = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [b, setB] = useState(null);
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(null); // 'Rejected' | 'Cancelled' | 'Completed' | 'Confirmed'
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    let live = true;
    (async () => {
      setLoading(true);
      setError('');
      const res = await getBooking(id);
      if (!live) return;
      setLoading(false);
      if (res.ok) setB(res.data);
      else setError(res.message);
    })();
    return () => {
      live = false;
    };
  }, [id, reloadKey]);

  const change = async (status, reason) => {
    setBusy(true);
    const res = await setBookingStatus(b.id, status, reason);
    setBusy(false);
    setAsk(null);
    if (res.ok) {
      notify.success(res.message);
      setB(res.data);
      onChanged();
    } else notify.error(res.message);
  };

  const s = b ? effectiveStatus(b) : null;
  const meta = b ? eventMeta(b.eventType) : null;
  const paid = b ? (b.advance || 0) + (b.rcdAmount || 0) : 0;
  const live = b && (b.status === 'Confirmed' || b.status === 'Completed');

  return (
    <Drawer anchor="right" open={!!id} onClose={onClose} PaperProps={{ sx: { width: narrow ? '100%' : 440 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={700}>Booking {b?.bookingRef || ''}</Typography>
        <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
      </Stack>
      <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <Stack spacing={1.5}><Skeleton height={60} /><Skeleton height={140} variant="rounded" /><Skeleton height={140} variant="rounded" /></Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : b && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(meta.color, 0.15), color: meta.color, width: 52, height: 52 }}>{meta.icon}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" fontWeight={700} noWrap>{b.customerName}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusBadge booking={b} />
                  {b.source === 'online' && <Chip size="small" icon={<PublicIcon />} label="Online" variant="outlined" />}
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button size="small" variant="outlined" startIcon={<PhoneOutlinedIcon />} href={`tel:${b.primary_phone}`}>Call</Button>
              <Button size="small" variant="outlined" color="success" startIcon={<WhatsAppIcon />} target="_blank" rel="noopener noreferrer"
                href={`https://wa.me/${waDigits(b.primary_phone)}?text=${encodeURIComponent(`Hello ${b.customerName}, about your ${b.eventType || ''} booking at ${b.mahalName} on ${fmtRange(b.fromDate, b.toDate)} (ref ${b.bookingRef || ''}).`)}`}>
                WhatsApp
              </Button>
              <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => onEdit(b)}>Edit</Button>
            </Stack>

            {b.status === 'Pending' && (
              <Card component={motion.div} initial={{ scale: 0.97 }} animate={{ scale: 1 }} sx={{ mt: 2.5, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), border: 1, borderColor: alpha(theme.palette.warning.main, 0.4), boxShadow: 'none' }}>
                <Typography fontWeight={700}>New booking request</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Call the customer, then confirm to block the dates.</Typography>
                <Stack direction="row" spacing={1}>
                  <Button variant="contained" color="success" startIcon={<CheckIcon />} disabled={busy} onClick={() => change('Confirmed')}>Confirm</Button>
                  <Button color="error" startIcon={<BlockIcon />} disabled={busy} onClick={() => setAsk('Rejected')}>Decline</Button>
                </Stack>
              </Card>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="overline" color="text.secondary">Event</Typography>
              <Line label="Hall">{b.mahalName}</Line>
              <Line label="Event">{b.eventType || '—'}</Line>
              <Line label="From">{fmtDate(b.fromDate, true)}</Line>
              <Line label="To">{fmtDate(b.toDate, true)}</Line>
              {b.guestCount > 0 && <Line label="Guests">{b.guestCount.toLocaleString('en-IN')}</Line>}
              <Line label="Phone">{b.primary_phone}</Line>
              {b.email && <Line label="Email">{b.email}</Line>}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="overline" color="text.secondary">Payment</Typography>
              <Line label="Hall rent">{rupees(b.totalAmount)}</Line>
              {b.discount > 0 && <Line label="Discount">− {rupees(b.discount)}</Line>}
              <Line label="Received">{rupees(paid)}{b.payMethod ? ` · ${b.payMethod}` : ''}</Line>
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography fontWeight={700}>Balance</Typography>
                <Typography variant="h6" fontWeight={800} color={b.balance > 0 ? 'warning.main' : 'success.main'}>{rupees(b.balance)}</Typography>
              </Stack>
              {b.totalAmount - b.discount > 0 && (
                <Box sx={{ mt: 1, height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden' }}>
                  <Box component={motion.div} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (paid / (b.totalAmount - b.discount)) * 100)}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} sx={{ height: '100%', bgcolor: 'success.main', borderRadius: 4 }} />
                </Box>
              )}
              {live && b.balance > 0 && (
                <Button sx={{ mt: 1.5 }} fullWidth variant="outlined" startIcon={<PaymentsOutlinedIcon />} onClick={() => setPaying(true)}>Record payment</Button>
              )}
            </Box>

            {b.remarks && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="overline" color="text.secondary">Notes</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{b.remarks}</Typography>
              </Box>
            )}
            {b.cancelReason && <Alert severity="info" sx={{ mt: 2 }}>Reason: {b.cancelReason}</Alert>}

            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {b.status === 'Confirmed' && s === 'Completed' && <Button startIcon={<TaskAltIcon />} disabled={busy} onClick={() => change('Completed')}>Mark completed</Button>}
              {b.status === 'Confirmed' && <Button color="error" startIcon={<EventBusyOutlinedIcon />} disabled={busy} onClick={() => setAsk('Cancelled')}>Cancel booking</Button>}
              {b.status === 'Cancelled' && <Button startIcon={<UndoIcon />} disabled={busy} onClick={() => change('Confirmed')}>Restore booking</Button>}
              {b.status === 'Rejected' && <Button startIcon={<UndoIcon />} disabled={busy} onClick={() => change('Pending')}>Reopen request</Button>}
              {b.status === 'Completed' && <Button startIcon={<UndoIcon />} disabled={busy} onClick={() => change('Confirmed')}>Mark not completed</Button>}
            </Stack>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
              {b.source === 'online' ? 'Requested online' : 'Added by the hall'} on {fmtDate(b.createdDt, true)}
            </Typography>
          </motion.div>
        )}
      </Box>

      <ReasonDialog
        open={ask === 'Rejected' || ask === 'Cancelled'}
        title={ask === 'Rejected' ? 'Decline this request?' : 'Cancel this booking?'}
        label={ask === 'Rejected' ? 'Reason, e.g. dates not free' : 'Reason for cancelling'}
        confirmText={ask === 'Rejected' ? 'Decline' : 'Cancel booking'}
        busy={busy}
        onClose={() => setAsk(null)}
        onConfirm={(r) => change(ask, r)}
      />
      <PaymentDialog open={paying} booking={b} onClose={() => setPaying(false)} onDone={(nb) => { setPaying(false); setB(nb); onChanged(); }} />
    </Drawer>
  );
};

// ---------------------------------------------------------------- list rows and calendar

const BookingRow = ({ b, index, onOpen }) => {
  const theme = useTheme();
  const meta = eventMeta(b.eventType);
  const d = new Date(b.fromDate);
  return (
    <Card
      component={motion.div}
      variants={fadeUp}
      custom={index}
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, x: -20 }}
      layout
      whileHover={{ x: 4 }}
      onClick={() => onOpen(b.id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(b.id))}
      tabIndex={0}
      role="button"
      aria-label={`Booking for ${b.customerName}`}
      sx={{ p: 2, cursor: 'pointer', borderLeft: `4px solid ${meta.color}`, '&:hover': { boxShadow: theme.shadows[4] }, '&:focus-visible': { outline: `2px solid ${theme.palette.primary.main}` } }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ textAlign: 'center', minWidth: 56, py: 0.5, borderRadius: 2, bgcolor: alpha(meta.color, 0.1) }}>
          <Typography variant="caption" sx={{ color: meta.color, fontWeight: 700, textTransform: 'uppercase' }}>{d.toLocaleDateString('en-IN', { month: 'short' })}</Typography>
          <Typography variant="h5" fontWeight={800} lineHeight={1}>{d.getDate()}</Typography>
          <Typography variant="caption" color="text.secondary">{d.toLocaleDateString('en-IN', { weekday: 'short' })}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography fontWeight={700} noWrap>{b.customerName}</Typography>
            {b.source === 'online' && <Tooltip title="Booked online"><PublicIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></Tooltip>}
          </Stack>
          <Typography variant="body2" color="text.secondary" noWrap>
            {b.eventType || 'Event'} · {fmtRange(b.fromDate, b.toDate)} · {b.mahalName}
          </Typography>
          <Typography variant="caption" color="text.secondary">{b.primary_phone}{b.guestCount ? ` · ${b.guestCount} guests` : ''}</Typography>
        </Box>
        <Stack alignItems="flex-end" spacing={0.75} sx={{ flexShrink: 0 }}>
          <StatusBadge booking={b} />
          {b.balance > 0 && b.status !== 'Rejected' && b.status !== 'Cancelled' && (
            <Typography variant="caption" color="warning.main" fontWeight={700}>{rupees(b.balance)} due</Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

const CalendarView = ({ mahalId, onOpen, reloadKey }) => {
  const theme = useTheme();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    (async () => {
      setLoading(true);
      const from = new Date();
      from.setMonth(from.getMonth() - 3, 1);
      const to = new Date();
      to.setMonth(to.getMonth() + 13, 1);
      const res = await listBookings({ status: 'Active', mahalId: mahalId || undefined, from: toDay(from), to: toDay(to), pageSize: 500 });
      if (!live) return;
      setLoading(false);
      setItems(res.ok ? res.data?.items || [] : []);
    })();
    return () => {
      live = false;
    };
  }, [mahalId, reloadKey]);

  const byDay = useMemo(() => {
    const map = new Map();
    items.forEach((b) => {
      const end = new Date(b.toDate);
      for (let d = new Date(new Date(b.fromDate).setHours(0, 0, 0, 0)); d < end; d.setDate(d.getDate() + 1)) {
        const k = toDay(d);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(b);
      }
    });
    return map;
  }, [items]);

  return (
    <Card sx={{ p: { xs: 1.5, md: 2.5 }, position: 'relative' }}>
      {loading && <CircularProgress size={22} sx={{ position: 'absolute', right: 20, top: 20 }} />}
      <AvailabilityCalendar
        booked={new Set()}
        renderDay={(key) => (
          <Stack spacing={0.25} sx={{ mt: 0.25, overflow: 'hidden' }}>
            {(byDay.get(key) || []).slice(0, 2).map((b) => {
              const meta = eventMeta(b.eventType);
              const pending = b.status === 'Pending';
              return (
                <Box
                  key={b.id}
                  component="span"
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); onOpen(b.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onOpen(b.id); } }}
                  title={`${b.customerName} · ${b.eventType || ''} · ${STATUS[b.status]?.label}`}
                  sx={{
                    display: 'block', fontSize: 11, lineHeight: 1.5, px: 0.5, borderRadius: 0.75, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', cursor: 'pointer',
                    color: pending ? theme.palette.warning.dark : '#fff',
                    bgcolor: pending ? alpha(theme.palette.warning.main, 0.2) : meta.color,
                    border: pending ? `1px dashed ${theme.palette.warning.main}` : 'none',
                  }}
                >
                  {b.customerName}
                </Box>
              );
            })}
            {(byDay.get(key) || []).length > 2 && <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>+{byDay.get(key).length - 2} more</Typography>}
          </Stack>
        )}
      />
      <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
        <Stack direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 14, height: 14, borderRadius: 0.75, bgcolor: 'primary.main' }} /><Typography variant="caption">Confirmed (colour = event)</Typography></Stack>
        <Stack direction="row" spacing={0.75} alignItems="center"><Box sx={{ width: 14, height: 14, borderRadius: 0.75, border: `1px dashed ${theme.palette.warning.main}`, bgcolor: alpha(theme.palette.warning.main, 0.2) }} /><Typography variant="caption">Request waiting for you</Typography></Stack>
      </Stack>
    </Card>
  );
};

// ---------------------------------------------------------------- page

/** Owner: every booking of their halls, with requests to approve. */
const MahalBookings = () => {
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') ?? 'Upcoming');
  const [view, setView] = useState('list');
  const [mahalId, setMahalId] = useState(params.get('mahal') || '');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({ items: [], total: 0, counts: {} });
  const [mahals, setMahals] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [formOpen, setFormOpen] = useState(params.get('new') === '1');
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [followCount, setFollowCount] = useState(0);
  const aiEnabled = useAiEnabled();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    listMyMahals().then((r) => r.ok && setMahals(r.data || []));
    // Rule-based on the server (no AI cost): just the count for the badge.
    listFollowUps().then((r) => r.ok && setFollowCount(r.data.open || 0));
  }, []);

  const load = useCallback(async (append = false, pageNo = 1) => {
    setLoading(true);
    setError('');
    const res = await listBookings({ status: tab || undefined, mahalId: mahalId || undefined, search: search.trim() || undefined, page: pageNo, pageSize: PAGE });
    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setData((d) => ({ ...res.data, items: append ? [...d.items, ...(res.data.items || [])] : res.data.items || [] }));
  }, [tab, mahalId, search]);

  useEffect(() => {
    const id = setTimeout(() => {
      setPage(1);
      load(false, 1);
    }, search ? 350 : 0);
    return () => clearTimeout(id);
  }, [load, search, reloadKey]);

  useEffect(() => {
    const next = {};
    if (tab !== 'Upcoming') next.tab = tab;
    if (mahalId) next.mahal = mahalId;
    setParams(next, { replace: true });
  }, [tab, mahalId, setParams]);

  const refresh = () => setReloadKey((k) => k + 1);
  const more = () => {
    const next = page + 1;
    setPage(next);
    load(true, next);
  };
  const openNew = () => {
    setEditing(null);
    setDraft(null);
    setFormOpen(true);
  };
  const openDraft = (d) => {
    setEditing(null);
    setDraft(d);
    setFormOpen(true);
  };
  const saved = (b) => {
    setFormOpen(false);
    setEditing(null);
    setDraft(null);
    refresh();
    if (b?.id) setOpenId(b.id);
  };

  const counts = data.counts || {};
  const noMahals = mahals.length === 0;

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title="Bookings"
        subtitle="Requests from the booking site and bookings you take directly."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Bookings' }]}
        actions={
          <>
            <Tooltip title="Refresh"><IconButton onClick={refresh} aria-label="Refresh"><RefreshIcon /></IconButton></Tooltip>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} disabled={noMahals}>New booking</Button>
          </>
        }
      />

      <Card sx={{ mb: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" sx={{ px: { xs: 1, md: 2 }, pt: 1, pb: { xs: 1.5, md: 1 } }} spacing={1.5}>
          {view === 'calendar' || view === 'followups' ? (
            <Typography fontWeight={600} sx={{ px: 1, py: 1.5 }}>
              {view === 'calendar' ? 'Confirmed bookings and open requests' : 'Follow-ups: who to message today'}
            </Typography>
          ) : (
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile sx={{ minHeight: 48 }}>
            {TABS.map((t) => (
              <Tab
                key={t.label}
                value={t.key}
                sx={{ minHeight: 48 }}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{t.label}</span>
                    {t.key === 'Pending' && counts.Pending > 0 ? (
                      <Badge badgeContent={counts.Pending} color="warning" sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none' } }} />
                    ) : (
                      <Typography variant="caption" color="text.secondary">{counts[t.count || t.key] ?? ''}</Typography>
                    )}
                  </Stack>
                }
              />
            ))}
          </Tabs>
          )}
          <Stack direction="row" spacing={1} sx={{ px: { xs: 1, md: 0 } }}>
            {mahals.length > 1 && (
              <TextField select size="small" label="Mahal" value={mahalId} onChange={(e) => setMahalId(e.target.value)} sx={{ minWidth: 160 }} SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}>
                <MenuItem value="">All mahals</MenuItem>
                {mahals.map((m) => <MenuItem key={m.id} value={String(m.id)}>{m.mahalName}</MenuItem>)}
              </TextField>
            )}
            <ToggleButtonGroup size="small" exclusive value={view} onChange={(_, v) => v && setView(v)} aria-label="View">
              <ToggleButton value="list" aria-label="List"><ViewListIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="calendar" aria-label="Calendar"><CalendarMonthIcon fontSize="small" /></ToggleButton>
              <ToggleButton value="followups" aria-label="Follow-ups">
                <Badge badgeContent={followCount} color="error" max={99}><ForumOutlinedIcon fontSize="small" /></Badge>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
        {view === 'list' && (
          <Box sx={{ px: 2, pb: 2 }}>
            <TextField fullWidth size="small" placeholder="Search name, phone, reference or event" value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
          </Box>
        )}
      </Card>

      {aiEnabled && !noMahals && view !== 'followups' && <AiQuickBooking mahalId={mahalId ? Number(mahalId) : undefined} onDraft={openDraft} />}

      {error && view !== 'followups' && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={refresh}>Retry</Button>}>{error}</Alert>}

      <AnimatePresence mode="wait">
        {view === 'followups' ? (
          <motion.div key="follow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <FollowUpsPanel onCount={setFollowCount} />
          </motion.div>
        ) : view === 'calendar' ? (
          <motion.div key="cal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CalendarView mahalId={mahalId} onOpen={setOpenId} reloadKey={reloadKey} />
          </motion.div>
        ) : (
          <motion.div key={`list-${tab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {loading && data.items.length === 0 ? (
              <Stack spacing={1.5}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={88} />)}</Stack>
            ) : data.items.length === 0 && !error ? (
              <Card>
                <EmptyState
                  icon={<EventNoteOutlinedIcon />}
                  title={noMahals ? 'Add your mahal first' : tab === 'Pending' ? 'No requests waiting' : 'No bookings here'}
                  description={noMahals ? 'Bookings belong to a hall. Add your hall, then take bookings here.' : tab === 'Pending' ? 'Requests from the booking site appear here for you to confirm.' : 'Bookings you add or confirm will show up here.'}
                  action={noMahals ? <Button variant="contained" href="/my-mahals?new=1">Add mahal</Button> : <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>New booking</Button>}
                />
              </Card>
            ) : (
              <Stack spacing={1.5}>
                <AnimatePresence>
                  {data.items.map((b, i) => <BookingRow key={b.id} b={b} index={i % PAGE} onOpen={setOpenId} />)}
                </AnimatePresence>
                {data.items.length < data.total && (
                  <Button onClick={more} disabled={loading} sx={{ alignSelf: 'center' }} startIcon={loading ? <CircularProgress size={16} /> : null}>
                    Show more ({data.total - data.items.length} left)
                  </Button>
                )}
              </Stack>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <BookingDrawer id={openId} reloadKey={reloadKey} onClose={() => setOpenId(null)} onChanged={refresh} onEdit={(b) => { setEditing(b); setFormOpen(true); }} />
      <BookingFormDialog
        open={formOpen}
        booking={editing}
        draft={draft}
        mahals={mahals}
        defaultMahal={mahalId ? Number(mahalId) : undefined}
        onClose={() => { setFormOpen(false); setEditing(null); setDraft(null); if (params.get('new')) setParams({}, { replace: true }); }}
        onSaved={saved}
      />
    </Box>
  );
};

export default MahalBookings;
