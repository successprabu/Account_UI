import { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment, Stack, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { changePassword } from '../../api/otp';
import { notify } from '../ui';

/** Change password while signed in. The new one works for every account of this mobile number. */
const ChangePasswordDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ current: '', next: '', confirm: '' });
      setErrors({});
      setError('');
    }
  }, [open]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = async () => {
    const er = {};
    if (!form.current) er.current = 'Enter your current password';
    if (form.next.length < 6) er.next = 'At least 6 characters';
    if (form.next !== form.confirm) er.confirm = 'The passwords do not match';
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    const res = await changePassword(form.current, form.next);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    notify.success('Password changed');
    onClose();
  };

  const eye = (
    <InputAdornment position="end">
      <IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label={show ? 'Hide passwords' : 'Show passwords'}>
        {show ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="xs" fullScreen={fullScreen}>
      <DialogTitle sx={{ pr: 6, fontWeight: 800 }}>
        Change password
        <IconButton onClick={onClose} disabled={busy} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Stack spacing={2} component="form" noValidate onSubmit={(e) => { e.preventDefault(); save(); }}>
          <TextField label="Current password" type={show ? 'text' : 'password'} value={form.current} onChange={set('current')} error={!!errors.current} helperText={errors.current} autoComplete="current-password" autoFocus InputProps={{ endAdornment: eye }} />
          <TextField label="New password" type={show ? 'text' : 'password'} value={form.next} onChange={set('next')} error={!!errors.next} helperText={errors.next || 'At least 6 characters'} autoComplete="new-password" />
          <TextField label="Confirm new password" type={show ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} error={!!errors.confirm} helperText={errors.confirm} autoComplete="new-password" />
          <button type="submit" hidden aria-hidden="true" />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={save} disabled={busy} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}>Change password</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
