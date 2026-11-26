import { useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { PageHeader, notify } from '../../ui';
import { BASE_URL } from '../../common/CommonApiURL';

/** The kinds of client a super admin can register. userType is what the API stores. */
const KINDS = {
  moitech: {
    label: 'DigiMoi client',
    product: 'DigiMoi',
    userType: 'AU',
    role: 'Admin',
    trialDays: 7,
    icon: <VolunteerActivismOutlinedIcon />,
    color: '#6366f1',
    hint: 'Families and organisers who record moi at functions. 7 days free.',
  },
  mahal: {
    label: 'Mahal owner',
    product: 'Mahal Management',
    userType: 'MU',
    role: 'Mahal Admin',
    trialDays: 30,
    icon: <ApartmentOutlinedIcon />,
    color: '#f59e0b',
    hint: 'Hall owners who take bookings. 1 month free.',
  },
};

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

// Easy to read aloud or type: no 0/O or 1/l.
const newPassword = () => {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(8);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
};

const emptyForm = () => ({ name: '', phone: '', whatsapp: true, password: newPassword() });

/** Super admin: register a Moitech client or a mahal owner and share their login. */
const RegisterClient = () => {
  const theme = useTheme();
  const [params] = useSearchParams();
  const admin = useMemo(readUser, []);
  const [kind, setKind] = useState(params.get('type') === 'mahal' ? 'mahal' : 'moitech');
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [done, setDone] = useState(null);
  const k = KINDS[kind];

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: key === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Enter the client name';
    if (!/^[6-9]\d{9}$/.test(form.phone)) er.phone = 'Enter a 10 digit mobile number';
    if (form.password.length < 6) er.password = 'At least 6 characters';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError('');
    const now = new Date();
    const trialEnd = new Date(now.getTime() + k.trialDays * 86400000);
    const by = String(admin?.id ?? 'SYSTEM');
    // Same shape as the public sign-up pages, as an independent account (customerId 0).
    const payload = {
      id: 0,
      name: form.name.trim(),
      primary_phone: form.phone,
      secondary_phone: '',
      country: '',
      state: '',
      district: '',
      address_line1: '',
      address_line2: '',
      is_primary_phone_whatsup: form.whatsapp,
      is_secondary_phone_whatsup: false,
      pincode: 0,
      userType: k.userType,
      customerId: 0,
      appName: 'MOI',
      country_code: '+91',
      password: form.password,
      isActive: true,
      activated_from: now.toISOString(),
      activated_To: trialEnd.toISOString(),
      current_plan_id: 0,
      previous_plan_id: 0,
      referedBy: by,
      createdBy: by,
      createdDt: now.toISOString(),
      updatedBy: by,
      updatedDt: now.toISOString(),
    };
    try {
      const res = await axios.post(`${BASE_URL}Auth/AddCustomer`, payload, {
        headers: { Authorization: `Bearer ${admin?.token || ''}` },
        timeout: 20000,
      });
      if (res.data?.result === false) throw Object.assign(new Error(res.data.message), { serverMessage: res.data.message });
      setDone({ ...form, kind });
      notify.success(`${k.label} registered`);
    } catch (err) {
      const msg = err.serverMessage || err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : '');
      setSaveError(
        /already/i.test(msg || '')
          ? `This mobile number already has a ${k.product} account. Ask them to sign in, or use a different number.`
          : msg || 'Could not register the client. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const loginUrl = `${window.location.origin}/login`;
  const message = done
    ? [
        `Welcome to MySuccess ${KINDS[done.kind].product}!`,
        `Your account is ready, free for ${KINDS[done.kind].trialDays === 30 ? '1 month' : `${KINDS[done.kind].trialDays} days`}.`,
        `Sign in: ${loginUrl}`,
        `Mobile number: ${done.phone}`,
        `Password: ${done.password}`,
        'Please change your password after you sign in.',
      ].join('\n')
    : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      notify.success('Login details copied');
    } catch (e) {
      notify.info('Select the text and copy it');
    }
  };

  const another = () => {
    setDone(null);
    setForm(emptyForm());
  };

  return (
    <Box sx={{ py: { xs: 2.5, md: 3 }, maxWidth: 760 }}>
      <PageHeader
        title="Register a client"
        subtitle="Create a DigiMoi or Mahal Management account for a client and send them their login."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Clients', to: '/client-list' }, { label: 'Register a client' }]}
      />

      <AnimatePresence mode="wait">
        {done ? (
          <Card key="done" component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} sx={{ p: { xs: 2.5, md: 4 } }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box component={motion.div} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 15 }}>
                <CheckCircleIcon sx={{ fontSize: 52, color: 'success.main' }} />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={700}>{done.name} is registered</Typography>
                <Typography color="text.secondary">{KINDS[done.kind].label} · signs in as {KINDS[done.kind].role}</Typography>
              </Box>
            </Stack>
            <Typography variant="subtitle2" sx={{ mt: 3, mb: 1 }}>Send these login details to the client</Typography>
            <Box component="pre" sx={{ m: 0, p: 2, borderRadius: 2, bgcolor: 'action.hover', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14 }}>
              {message}
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/91${done.phone}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Send on WhatsApp
              </Button>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={copy}>Copy</Button>
              <Button startIcon={<PersonAddAltOutlinedIcon />} onClick={another}>Register another</Button>
              <Button component={RouterLink} to="/client-list">Client list</Button>
            </Stack>
          </Card>
        ) : (
          <Card key="form" component={motion.form} onSubmit={submit} noValidate initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>What are you registering?</Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={kind}
              onChange={(_, v) => v && setKind(v)}
              aria-label="Client type"
              sx={{ gap: 1.5, '& .MuiToggleButtonGroup-grouped': { border: '1px solid !important', borderColor: 'divider !important', borderRadius: '12px !important' } }}
            >
              {Object.entries(KINDS).map(([key, x]) => (
                <ToggleButton
                  key={key}
                  value={key}
                  sx={{
                    p: 2,
                    textTransform: 'none',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    '&.Mui-selected': { bgcolor: alpha(x.color, 0.1), borderColor: `${x.color} !important`, '&:hover': { bgcolor: alpha(x.color, 0.14) } },
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ color: x.color, display: 'flex', mt: 0.25 }}>{x.icon}</Box>
                    <Box>
                      <Typography fontWeight={700} color="text.primary">{x.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{x.hint}</Typography>
                    </Box>
                  </Stack>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <Grid container spacing={2} sx={{ mt: 1.5 }}>
              <Grid item xs={12}>
                <TextField fullWidth required label={kind === 'mahal' ? 'Owner name' : 'Client name'} value={form.name} onChange={set('name')} error={!!errors.name} helperText={errors.name} autoComplete="off" />
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  required
                  label="Mobile number"
                  value={form.phone}
                  onChange={set('phone')}
                  error={!!errors.phone}
                  helperText={errors.phone || 'They sign in with this number'}
                  inputProps={{ inputMode: 'numeric' }}
                  InputProps={{ startAdornment: <InputAdornment position="start">+91</InputAdornment> }}
                />
              </Grid>
              <Grid item xs={12} sm={5} sx={{ display: 'flex', alignItems: 'center' }}>
                <FormControlLabel control={<Checkbox checked={form.whatsapp} onChange={set('whatsapp')} />} label="This number has WhatsApp" />
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  required
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  error={!!errors.password}
                  helperText={errors.password || 'Created for you. You will send it to the client.'}
                  autoComplete="new-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={showPassword ? 'Hide' : 'Show'}>
                          <IconButton onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? 'Hide password' : 'Show password'} edge="end">
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="New password">
                          <IconButton onClick={() => setForm((f) => ({ ...f, password: newPassword() }))} aria-label="Make a new password" edge="end" sx={{ ml: 0.5 }}>
                            <AutorenewIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Alert severity="info" variant="outlined" sx={{ mt: 2.5, borderColor: alpha(theme.palette.info.main, 0.3) }}>
              {kind === 'mahal'
                ? 'They sign in as Mahal Admin, add their hall under My mahals and can take bookings right away. First month free.'
                : 'They sign in as Admin, add their function and start recording moi. First 7 days free.'}
            </Alert>
            {saveError && <Alert severity="error" sx={{ mt: 2 }}>{saveError}</Alert>}

            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button type="submit" variant="contained" size="large" disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <PersonAddAltOutlinedIcon />}>
                {saving ? 'Registering…' : `Register ${k.label.toLowerCase()}`}
              </Button>
            </Stack>
          </Card>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default RegisterClient;
