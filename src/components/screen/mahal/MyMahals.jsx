import { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Alert,
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
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseIcon from '@mui/icons-material/Close';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PublicIcon from '@mui/icons-material/Public';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { PageHeader, EmptyState, notify } from '../../ui';
import { getDistricts, getStates, listMyMahals, saveMahal } from '../../../api/mahal';
import { AMENITIES, EVENT_TYPES, MahalImage, fadeUp, placeLine, rupees } from '../../mahal/shared';
import PhotoManager, { uploadQueued } from '../../mahal/PhotoManager';

const blank = {
  id: 0,
  mahalName: '',
  description: '',
  contactPerson: '',
  contactNumber: '',
  country: 1,
  state: '',
  district: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  pincode: '',
  capacity: '',
  diningCapacity: '',
  roomCount: '',
  pricePerDay: '',
  advanceAmount: '',
  amenities: [],
  eventTypes: ['Marriage', 'Reception', 'Engagement', 'Birthday'],
  imageUrl: '',
  isOnlineBooking: true,
  isActive: true,
};

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
const digits = (max) => (e) => e.target.value.replace(/[^\d]/g, '').slice(0, max);

const ChipPicker = ({ label, options, value, onChange }) => (
  <Box>
    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>{label}</Typography>
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <Chip
            key={o}
            label={o}
            clickable
            onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            color={on ? 'primary' : 'default'}
            variant={on ? 'filled' : 'outlined'}
            aria-pressed={on}
          />
        );
      })}
    </Stack>
  </Box>
);

/** Add or edit a hall. */
export const MahalFormDialog = ({ open, mahal, onClose, onSaved }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  // Photos of a saved hall (ids, cover first), and photos chosen for a new hall, uploaded once it is saved.
  const [photos, setPhotos] = useState([]);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    if (!open) return;
    setForm(mahal ? { ...blank, ...mahal, state: mahal.state || '', district: mahal.district || '', pincode: mahal.pincode || '', amenities: mahal.amenities || [], eventTypes: mahal.eventTypes || [] } : blank);
    setPhotos(mahal?.photos || []);
    setQueue([]);
    setErrors({});
    setSaveError('');
  }, [open, mahal]);

  useEffect(() => {
    if (!open) return;
    getStates(form.country || 1).then((r) => setStates(r.ok ? r.data || [] : []));
  }, [open, form.country]);

  useEffect(() => {
    if (!open || !form.state) {
      setDistricts([]);
      return;
    }
    getDistricts(form.state).then((r) => setDistricts(r.ok ? r.data || [] : []));
  }, [open, form.state]);

  const set = (k, transform) => (e) => {
    const value = transform ? transform(e) : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.mahalName.trim().length < 2) er.mahalName = 'Enter the hall name';
    if (!form.addressLine1.trim()) er.addressLine1 = 'Enter the address';
    if (!form.state) er.state = 'Choose the state';
    if (!form.district) er.district = 'Choose the district';
    if (String(form.pincode).length !== 6) er.pincode = '6 digit pincode';
    if (form.contactNumber && form.contactNumber.replace(/\D/g, '').length < 10) er.contactNumber = 'Enter a valid phone number';
    if (form.imageUrl && !/^https?:\/\//i.test(form.imageUrl.trim())) er.imageUrl = 'Paste a link starting with https://';
    if (form.isOnlineBooking && !form.eventTypes.length) er.eventTypes = 'Pick at least one event';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');
    const res = await saveMahal({
      ...form,
      state: Number(form.state),
      district: Number(form.district),
      pincode: Number(form.pincode),
      capacity: num(form.capacity),
      diningCapacity: num(form.diningCapacity),
      roomCount: num(form.roomCount),
      pricePerDay: num(form.pricePerDay),
      advanceAmount: num(form.advanceAmount),
    });
    if (res.ok && !form.id && queue.length && res.data?.id) {
      const failed = await uploadQueued(res.data.id, queue, (i, n) => notify.info(`Uploading photo ${i} of ${n}…`, { toastId: `photo-${i}`, autoClose: 1500 }));
      if (failed) notify.warning(`${failed} photo(s) could not be uploaded. Open the hall and add them again.`);
    }
    setSaving(false);
    if (res.ok) {
      notify.success(res.message || 'Saved');
      onSaved(res.data);
    } else setSaveError(res.message);
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullScreen={fullScreen} maxWidth="md" fullWidth scroll="paper" PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle sx={{ pr: 6 }}>
        {form.id ? 'Edit mahal' : 'Add a mahal'}
        <IconButton onClick={onClose} disabled={saving} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} useFlexGap>
          <Card variant="outlined" sx={{ p: 2, bgcolor: form.isOnlineBooking ? 'action.hover' : 'transparent' }}>
            <FormControlLabel
              control={<Switch checked={form.isOnlineBooking} onChange={(e) => setForm((f) => ({ ...f, isOnlineBooking: e.target.checked }))} />}
              label={<Box><Typography fontWeight={700}>Take bookings online</Typography><Typography variant="body2" color="text.secondary">Show this hall on the public booking site so customers can check dates and send requests.</Typography></Box>}
              sx={{ alignItems: 'flex-start', m: 0, '& .MuiSwitch-root': { mt: -0.5 } }}
            />
          </Card>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}><TextField fullWidth required label="Mahal name" value={form.mahalName} onChange={set('mahalName')} error={!!errors.mahalName} helperText={errors.mahalName} /></Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select label="Status" value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'active' }))}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive (hidden)</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField fullWidth multiline minRows={3} label="About the hall" placeholder="What makes it special: location, hall size, decoration, food, nearby temple…" value={form.description} onChange={set('description')} inputProps={{ maxLength: 1000 }} helperText={`${form.description.length}/1000`} /></Grid>
          </Grid>

          <Divider textAlign="left"><Typography variant="overline">Capacity and price</Typography></Divider>
          <Grid container spacing={2}>
            <Grid item xs={6} md={4}><TextField fullWidth label="Seating (guests)" value={form.capacity ?? ''} onChange={set('capacity', digits(6))} inputProps={{ inputMode: 'numeric' }} /></Grid>
            <Grid item xs={6} md={4}><TextField fullWidth label="Dining (per sitting)" value={form.diningCapacity ?? ''} onChange={set('diningCapacity', digits(6))} inputProps={{ inputMode: 'numeric' }} /></Grid>
            <Grid item xs={6} md={4}><TextField fullWidth label="Rooms" value={form.roomCount ?? ''} onChange={set('roomCount', digits(4))} inputProps={{ inputMode: 'numeric' }} /></Grid>
            <Grid item xs={6} md={6}><TextField fullWidth label="Rent per day" value={form.pricePerDay ?? ''} onChange={set('pricePerDay', digits(9))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'numeric' }} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Advance to confirm" value={form.advanceAmount ?? ''} onChange={set('advanceAmount', digits(9))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'numeric' }} /></Grid>
          </Grid>

          <Box>
            <ChipPicker label="Events you host" options={EVENT_TYPES.map((e) => e.key)} value={form.eventTypes} onChange={(v) => { setForm((f) => ({ ...f, eventTypes: v })); setErrors((er) => ({ ...er, eventTypes: undefined })); }} />
            {errors.eventTypes && <Typography color="error" variant="caption">{errors.eventTypes}</Typography>}
          </Box>
          <ChipPicker label="Facilities" options={AMENITIES} value={form.amenities} onChange={(v) => setForm((f) => ({ ...f, amenities: v }))} />

          <Divider textAlign="left"><Typography variant="overline">Address</Typography></Divider>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth required label="Address line 1" value={form.addressLine1} onChange={set('addressLine1')} error={!!errors.addressLine1} helperText={errors.addressLine1} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Address line 2" value={form.addressLine2 || ''} onChange={set('addressLine2')} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Landmark / area" value={form.landmark || ''} onChange={set('landmark')} /></Grid>
            <Grid item xs={12} md={5}>
              <TextField fullWidth select required label="State" value={form.state} onChange={(e) => { setForm((f) => ({ ...f, state: e.target.value, district: '' })); setErrors((er) => ({ ...er, state: undefined })); }} error={!!errors.state} helperText={errors.state}>
                {states.length === 0 && <MenuItem value="" disabled>Loading…</MenuItem>}
                {states.map((s) => <MenuItem key={s.id} value={s.id}>{s.stateName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth select required label="District" value={form.district} onChange={set('district')} disabled={!form.state} error={!!errors.district} helperText={errors.district}>
                {districts.map((d) => <MenuItem key={d.id} value={d.id}>{d.districtName}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}><TextField fullWidth required label="Pincode" value={form.pincode} onChange={set('pincode', digits(6))} error={!!errors.pincode} helperText={errors.pincode} inputProps={{ inputMode: 'numeric' }} /></Grid>
          </Grid>

          <Divider textAlign="left"><Typography variant="overline">Photos</Typography></Divider>
          <PhotoManager mahalId={form.id} photos={photos} onPhotos={setPhotos} queue={queue} onQueue={setQueue} />

          <Divider textAlign="left"><Typography variant="overline">Contact</Typography></Divider>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Contact person" value={form.contactPerson || ''} onChange={set('contactPerson')} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Contact number" type="tel" value={form.contactNumber || ''} onChange={set('contactNumber')} error={!!errors.contactNumber} helperText={errors.contactNumber || 'Shown to customers on the booking site'} /></Grid>
          </Grid>
          {saveError && <Alert severity="error">{saveError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}>
          {saving ? 'Saving…' : form.id ? 'Save changes' : 'Add mahal'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/** Owner: the halls they manage. */
const MyMahals = () => {
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mahals, setMahals] = useState([]);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(params.get('new') === '1');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const res = await listMyMahals();
    setLoading(false);
    if (res.ok) setMahals(res.data || []);
    else setError(res.message);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    if (params.get('new')) setParams({}, { replace: true });
    load(); // photos added or removed in the form show on the cards straight away
  };
  const saved = () => close();

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 } }}>
      <PageHeader
        title="My mahals"
        subtitle="Your halls, their details and whether they take online bookings."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'My mahals' }]}
        actions={
          <>
            <Button component={RouterLink} to="/mahals" target="_blank" startIcon={<PublicIcon />}>Booking site</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>Add mahal</Button>
          </>
        }
      />
      {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" onClick={load}>Retry</Button>}>{error}</Alert>}

      {loading ? (
        <Grid container spacing={3}>
          {[0, 1, 2].map((i) => (
            <Grid item xs={12} sm={6} lg={4} key={i}><Skeleton variant="rounded" height={320} /></Grid>
          ))}
        </Grid>
      ) : mahals.length === 0 && !error ? (
        <Card>
          <EmptyState icon={<ApartmentOutlinedIcon />} title="No mahals yet" description="Add your hall with its capacity, rent and facilities. Turn on online booking to start getting requests." action={<Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>Add your first mahal</Button>} />
        </Card>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {mahals.map((m, i) => (
              <Grid item xs={12} sm={6} lg={4} key={m.id}>
                <Card component={motion.div} variants={fadeUp} custom={i} initial="hidden" animate="show" whileHover={{ y: -4 }} className="mahal-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: m.isActive ? 1 : 0.65 }}>
                  <MahalImage mahal={m} height={150}>
                    <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 10, left: 10 }}>
                      {m.isOnlineBooking && m.isActive && <Chip size="small" icon={<PublicIcon />} label="Online" color="success" />}
                      {!m.isActive && <Chip size="small" label="Inactive" sx={{ bgcolor: 'rgba(15,23,42,.75)', color: '#fff' }} />}
                    </Stack>
                    {m.pendingRequests > 0 && (
                      <Chip
                        component={motion.div}
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity }}
                        size="small"
                        color="warning"
                        label={`${m.pendingRequests} new ${m.pendingRequests === 1 ? 'request' : 'requests'}`}
                        sx={{ position: 'absolute', top: 10, right: 10, fontWeight: 700 }}
                      />
                    )}
                  </MahalImage>
                  <Box sx={{ p: 2, flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} noWrap title={m.mahalName}>{m.mahalName}</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" color="text.secondary" sx={{ mt: 0.5 }}>
                      <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                      <Typography variant="body2" noWrap>{placeLine(m) || m.addressLine1}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} color="text.secondary">
                      {m.capacity > 0 && <Stack direction="row" spacing={0.5} alignItems="center"><GroupsOutlinedIcon sx={{ fontSize: 18 }} /><Typography variant="body2">{m.capacity}</Typography></Stack>}
                      {m.pricePerDay > 0 && <Typography variant="body2">{rupees(m.pricePerDay)}/day</Typography>}
                      <Typography variant="body2">{m.upcomingEvents} upcoming</Typography>
                    </Stack>
                  </Box>
                  <Divider />
                  <Stack direction="row" spacing={1} sx={{ p: 1.25 }}>
                    <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => { setEditing(m); setOpen(true); }}>Edit</Button>
                    <Button size="small" component={RouterLink} to={`/mahal-bookings?mahal=${m.id}`} startIcon={<EventNoteOutlinedIcon />}>Bookings</Button>
                    {m.isOnlineBooking && m.isActive && (
                      <Tooltip title="Open public page">
                        <IconButton size="small" component={RouterLink} to={`/mahals/${m.id}`} target="_blank" sx={{ ml: 'auto' }} aria-label="Open public page"><OpenInNewIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Card>
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      <MahalFormDialog open={open} mahal={editing} onClose={close} onSaved={saved} />
    </Box>
  );
};

export default MyMahals;
