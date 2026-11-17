import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { API_SERVICE } from '../common/CommonMethod';
import { SAVE_HANDOVER_API } from '../common/CommonApiURL';
import { AnimatedNumber, rupees } from './shared';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

/**
 * Record cash handed over by one collector. person: a row of the handover table
 * ({ userId, username, receipt, expense, others, total }).
 */
const HandoverDialog = ({ open, person, onClose, onSaved }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  // Same rule as before: the receipts total, or the others total when there are no receipts.
  const total = person ? (person.receipt === 0 ? person.others : person.receipt || 0) : 0;
  const [form, setForm] = useState({ handoverAmount: '', receivedBy: '', receivedByMoible: '', remarks: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ handoverAmount: '', receivedBy: person?.receivedBy || '', receivedByMoible: '', remarks: person?.remarks || '' });
      setError('');
    }
  }, [open, person]);

  if (!person) return null;
  const amount = Number(form.handoverAmount) || 0;
  const difference = total - amount;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!(amount > 0)) {
      setError(t('enterHandoverAmount', { defaultValue: 'Enter the amount handed over.' }));
      return;
    }
    if (!form.receivedBy.trim()) {
      setError(t('enterReceivedBy', { defaultValue: 'Enter who received the money.' }));
      return;
    }
    const user = readUser();
    setSaving(true);
    setError('');
    try {
      const response = await API_SERVICE.post(SAVE_HANDOVER_API, {
        id: person.id || 0,
        customerId: user?.customerID ?? 0,
        functionId: user?.functionId ?? 0,
        handoverBy: Number(person.userId),
        receivedBy: form.receivedBy.trim(),
        receivedByMoible: form.receivedByMoible.trim(),
        totalRcdAmount: total,
        handoverAmount: amount,
        differnceAmount: difference,
        remarks: form.remarks,
        createdBy: user?.id ?? 0,
        createdDt: new Date().toISOString(),
        updatedBy: user?.id ?? 0,
        updatedDt: new Date().toISOString(),
        isActive: true,
        status: 1,
      });
      if (response?.data?.result) {
        toast.success('Handover Completed Successfully');
        onSaved?.({ ...person, handoverAmount: amount, receivedBy: form.receivedBy });
        onClose();
      } else {
        setError(response?.data?.message || 'Something went wrong on Handover. Please try again.');
      }
    } catch (err) {
      console.error('There was an error saving the handover!', err);
      setError(err?.response?.data?.message || 'There was an error saving the handover! Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth PaperProps={{ component: 'form', onSubmit: save, noValidate: true }}>
      <DialogTitle sx={{ pr: 6 }}>
        {t('editHandover')}
        <IconButton onClick={onClose} disabled={saving} aria-label="Close" sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          {[
            [t('handoverBy'), t(person.username, { defaultValue: person.username }), 'text.primary'],
            [t('total'), rupees(total), 'primary.main'],
          ].map(([label, value, color]) => (
            <Grid item xs={6} key={label}>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography fontWeight={700} color={color} noWrap>{value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Stack spacing={2}>
          <TextField
            autoFocus
            required
            type="number"
            label={t('handoverAmount')}
            value={form.handoverAmount}
            onChange={set('handoverAmount')}
            inputProps={{ min: 0, inputMode: 'numeric' }}
            InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
            helperText={
              <Button size="small" sx={{ p: 0, minWidth: 0 }} onClick={() => setForm((f) => ({ ...f, handoverAmount: String(total) }))}>
                {t('handoverFullAmount', { defaultValue: 'Hand over the full {{amount}}', amount: rupees(total) })}
              </Button>
            }
          />
          <Box sx={{ px: 2, py: 1.25, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: alpha(difference === 0 ? theme.palette.success.main : theme.palette.warning.main, 0.1) }}>
            <Typography color="text.secondary">{t('differnceAmount')}</Typography>
            <Typography variant="h6" fontWeight={800} color={difference === 0 ? 'success.main' : 'warning.dark'}>
              <AnimatedNumber value={difference} />
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth required label={t('receivedBy')} value={form.receivedBy} onChange={set('receivedBy')} />
            <TextField fullWidth label={t('receivedByMobile')} type="tel" value={form.receivedByMoible} onChange={(e) => setForm((f) => ({ ...f, receivedByMoible: e.target.value.replace(/\D/g, '').slice(0, 10) }))} inputProps={{ inputMode: 'numeric' }} />
          </Stack>
          <TextField label={t('remarks')} multiline minRows={2} value={form.remarks} onChange={set('remarks')} />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>{t('cancel')}</Button>
        <Button type="submit" variant="contained" disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default HandoverDialog;
