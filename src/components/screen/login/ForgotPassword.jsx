import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert, Box, Button, Card, CircularProgress, Container, IconButton, InputAdornment, Link as MuiLink, Stack, TextField, Typography } from '@mui/material';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PasswordIcon from '@mui/icons-material/Password';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AppHeader from '../../common/AppHeader';
import { forgotPassword, resetPassword } from '../../../api/otp';

const RESEND_AFTER = 30;
const slide = { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -24 }, transition: { duration: 0.25 } };

/**
 * Forgot password: 1) registered mobile → OTP by SMS, 2) OTP + new password, 3) done.
 * The new password works for every account of that mobile number.
 */
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    document.title = 'Forgot password · My Success';
  }, []);
  useEffect(() => {
    if (wait <= 0) return undefined;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const send = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErrors({ phone: 'Enter your 10 digit registered mobile number' });
      return;
    }
    setErrors({});
    setError('');
    setBusy(true);
    const res = await forgotPassword(phone);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setWait(RESEND_AFTER);
    setStep('reset');
  };

  const reset = async () => {
    const er = {};
    if (!/^\d{6}$/.test(otp)) er.otp = 'Enter the 6 digit OTP';
    if (password.length < 8) er.password = 'At least 8 characters';
    if (password !== confirm) er.confirm = 'The passwords do not match';
    setErrors(er);
    if (Object.keys(er).length) return;
    setError('');
    setBusy(true);
    const res = await resetPassword(phone, otp, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setStep('done');
  };

  const pwAdornment = (
    <InputAdornment position="end">
      <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label={show ? 'Hide password' : 'Show password'}>
        {show ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader />
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
        <Card component={motion.div} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} sx={{ p: { xs: 3, sm: 4.5 }, borderRadius: 4, overflow: 'hidden' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'primary.main', color: '#fff' }}>
              <LockResetIcon />
            </Box>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 800 }}>Forgot password</Typography>
              <Typography variant="body2" color="text.secondary">
                {step === 'phone' ? 'We will send an OTP to your registered mobile.' : step === 'reset' ? `OTP sent to ${phone}.` : 'All set.'}
              </Typography>
            </Box>
          </Stack>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <AnimatePresence mode="wait">
            {step === 'phone' && (
              <Stack key="phone" component={motion.form} {...slide} spacing={2.5} noValidate onSubmit={(e) => { e.preventDefault(); send(); }}>
                <TextField
                  label="Registered mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  autoFocus
                  inputProps={{ inputMode: 'numeric' }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneOutlinedIcon fontSize="small" /> +91</InputAdornment> }}
                />
                <Button type="submit" variant="contained" size="large" disabled={busy} startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}>
                  Send OTP
                </Button>
              </Stack>
            )}

            {step === 'reset' && (
              <Stack key="reset" component={motion.form} {...slide} spacing={2} noValidate onSubmit={(e) => { e.preventDefault(); reset(); }}>
                <TextField
                  label="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  error={!!errors.otp}
                  helperText={errors.otp}
                  autoFocus
                  autoComplete="one-time-code"
                  inputProps={{ inputMode: 'numeric', style: { letterSpacing: 6, fontWeight: 700 } }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PasswordIcon fontSize="small" /></InputAdornment> }}
                />
                <TextField
                  label="New password"
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={!!errors.password}
                  helperText={errors.password || 'At least 8 characters'}
                  autoComplete="new-password"
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>, endAdornment: pwAdornment }}
                />
                <TextField
                  label="Confirm new password"
                  type={show ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  error={!!errors.confirm}
                  helperText={errors.confirm}
                  autoComplete="new-password"
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment> }}
                />
                <Button type="submit" variant="contained" size="large" disabled={busy} startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}>
                  Change password
                </Button>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Button size="small" startIcon={<ArrowBackIcon />} onClick={() => { setStep('phone'); setOtp(''); setError(''); }}>Change number</Button>
                  <Button size="small" onClick={send} disabled={wait > 0 || busy}>{wait > 0 ? `Resend OTP in ${wait}s` : 'Resend OTP'}</Button>
                </Stack>
              </Stack>
            )}

            {step === 'done' && (
              <Stack key="done" component={motion.div} {...slide} spacing={2} alignItems="center" textAlign="center" sx={{ py: 2 }}>
                <Box component={motion.div} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 15 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 72 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Password changed</Typography>
                <Typography color="text.secondary">Sign in with your mobile number and the new password, here and in the Android app.</Typography>
                <Button variant="contained" size="large" onClick={() => navigate('/login')}>Sign in</Button>
              </Stack>
            )}
          </AnimatePresence>

          {step !== 'done' && (
            <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
              Remembered it? <MuiLink component={Link} to="/login" fontWeight={600}>Sign in</MuiLink>
            </Typography>
          )}
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
