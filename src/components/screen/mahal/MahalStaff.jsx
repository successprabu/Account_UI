import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert, Avatar, Box, Button, Card, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton,
  InputAdornment, Skeleton, Stack, Switch, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { listStaff, saveStaff } from '../../../api/mahalOps';
import { EmptyState, notify } from '../../ui';
import { useTx } from '../../../language/site';

const CAN = ['Add and edit bookings', 'Confirm or decline requests', 'Record payments and make invoices', 'Send WhatsApp reminders', 'Add expenses'];
const CANNOT = ['See income and profit', 'Cancel bookings or delete expenses', 'Change hall details, photos or payment settings', 'Add other staff'];

const StaffDialog = ({ open, staff, onClose, onSaved }) => {
  const tx = useTx();
  const [form, setForm] = useState({ id: 0, name: '', phone: '', password: '', isActive: true });
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(staff ? { ...staff, password: '' } : { id: 0, name: '', phone: '', password: '', isActive: true });
  }, [open, staff]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveStaff(form);
    setSaving(false);
    if (res.ok) {
      notify.success(tx(res.message));
      onSaved();
    } else notify.error(tx(res.message));
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle>{tx(staff ? 'Edit staff login' : 'Add staff login')}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField label={tx('Name')} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required autoFocus />
          <TextField label={tx('Mobile number')} value={form.phone} required helperText={tx('They sign in with this number')}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} inputProps={{ inputMode: 'numeric' }} />
          <TextField label={tx(staff ? 'New password (leave empty to keep)' : 'Password')} type={show ? 'text' : 'password'} value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required={!staff} autoComplete="new-password"
            helperText={tx('At least 6 characters. Share it with them yourself.')}
            InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShow((s) => !s)} edge="end" aria-label={tx('Show password')}>{show ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
          {staff && (
            <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />}
              label={tx(form.isActive ? 'Can sign in' : 'Blocked from signing in')} />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>{tx('Close')}</Button>
        <Button type="submit" variant="contained" disabled={saving}>{tx('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

/** Staff logins for the owner's halls: managers who book and take payments without seeing profit. Owner only. */
const MahalStaff = () => {
  const tx = useTx();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(undefined);

  const load = useCallback(async () => {
    const res = await listStaff();
    if (res.ok) {
      setList(res.data || []);
      setError('');
    } else {
      setList([]);
      setError(res.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Staff logins')}</Typography>
          <Typography color="text.secondary">{tx('Give your manager their own login instead of sharing your password.')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setEditing(null)}>{tx('Add staff login')}</Button>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{tx(error)}</Alert>}

      <Card sx={{ p: { xs: 1.5, md: 2.5 }, mb: 3 }}>
        {list === null ? <Stack spacing={1}>{[0, 1].map((i) => <Skeleton key={i} height={56} />)}</Stack> : list.length === 0 ? (
          <EmptyState compact icon={<BadgeOutlinedIcon />} title={tx('No staff logins yet')} description={tx('Add a manager so they can take bookings and payments from their own phone.')} />
        ) : list.map((s, i) => (
          <Stack key={s.id} component={motion.div} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.25, borderBottom: 1, borderColor: 'divider', opacity: s.isActive ? 1 : 0.55 }}>
            <Avatar sx={{ bgcolor: 'primary.light' }}>{(s.name || '?').charAt(0).toUpperCase()}</Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>{s.name}</Typography>
              <Typography variant="body2" color="text.secondary">{s.phone}</Typography>
            </Box>
            <Chip size="small" label={tx(s.isActive ? 'Active' : 'Blocked')} color={s.isActive ? 'success' : 'default'} variant="outlined" />
            <IconButton onClick={() => setEditing(s)} aria-label={tx('Edit')}><EditOutlinedIcon /></IconButton>
          </Stack>
        ))}
      </Card>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Card variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>{tx('Staff can')}</Typography>
          {CAN.map((c) => <Stack key={c} direction="row" spacing={1} alignItems="center" sx={{ py: 0.4 }}><CheckIcon fontSize="small" color="success" /><Typography variant="body2">{tx(c)}</Typography></Stack>)}
        </Card>
        <Card variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography fontWeight={700} sx={{ mb: 1 }}>{tx('Only you can')}</Typography>
          {CANNOT.map((c) => <Stack key={c} direction="row" spacing={1} alignItems="center" sx={{ py: 0.4 }}><CloseIcon fontSize="small" color="error" /><Typography variant="body2">{tx(c)}</Typography></Stack>)}
        </Card>
      </Stack>

      <StaffDialog open={editing !== undefined} staff={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />
    </Container>
  );
};

export default MahalStaff;
