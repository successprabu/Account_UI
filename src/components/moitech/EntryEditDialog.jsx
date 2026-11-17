import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { rupees } from './shared';

/**
 * Edit one moi entry (receipt or other receipt). Total = old + new amount.
 * onSave(updated) must resolve to { ok, message }.
 */
const EntryEditDialog = ({ open, entry, title, onClose, onSave }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState(entry);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(entry);
      setError('');
    }
  }, [open, entry]);

  if (!form) return null;

  const set = (k) => (e) => {
    const value = k === 'isActive' ? e.target.checked : e.target.value;
    setForm((f) => {
      const next = { ...f, [k]: value };
      if (k === 'oldAmount' || k === 'newAmount') next.amount = Number(next.oldAmount || 0) + Number(next.newAmount || 0);
      return next;
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!String(form.name || '').trim() || !String(form.villageName || '').trim()) {
      setError(t('nameAndVillageRequired', { defaultValue: 'Name and village are required.' }));
      return;
    }
    if (!(Number(form.amount) > 0)) {
      setError(t('enterOldOrNewAmount', { defaultValue: 'Enter the old or new amount.' }));
      return;
    }
    setSaving(true);
    setError('');
    const res = await onSave(form);
    setSaving(false);
    if (!res?.ok) setError(res?.message || t('an_error_occurred', { defaultValue: 'Could not save. Please try again.' }));
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle sx={{ pr: 6 }}>
        {title || t('editTransaction')}
        <IconButton onClick={onClose} disabled={saving} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><TextField fullWidth required label={t('placeName')} value={form.villageName || ''} onChange={set('villageName')} /></Grid>
          <Grid item xs={8} sm={4}><TextField fullWidth required label={t('name')} value={form.name || ''} onChange={set('name')} /></Grid>
          <Grid item xs={4} sm={2}><TextField fullWidth label={t('initial')} value={form.initial || ''} onChange={set('initial')} /></Grid>
          {['oldAmount', 'newAmount'].map((k) => (
            <Grid item xs={6} key={k}>
              <TextField
                fullWidth
                type="number"
                label={t(k)}
                value={form[k] ?? 0}
                onChange={set(k)}
                onFocus={(e) => e.target.select()}
                inputProps={{ min: 0, inputMode: 'numeric' }}
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Box sx={{ px: 2, py: 1.25, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography color="text.secondary">{t('amount')}</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">{rupees(form.amount)}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t('phoneNo')} type="tel" value={form.phoneNo || ''} onChange={set('phoneNo')} /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t('remarks')} value={form.remarks || ''} onChange={set('remarks')} /></Grid>
          <Grid item xs={12}>
            <FormControlLabel control={<Switch checked={!!form.isActive} onChange={set('isActive')} />} label={t('active')} />
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>{t('cancel')}</Button>
        <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
          {t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntryEditDialog;
