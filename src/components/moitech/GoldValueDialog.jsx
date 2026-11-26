import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { getGold, setGoldRate } from '../../api/moiPlus';
import { rupees } from './shared';
import { notify } from '../ui';
import { useTranslation } from 'react-i18next';
import { useTx } from '../../language/site';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    return {};
  }
};
const PAVUN = 8; // grams in one sovereign (pavun)

/** Gold gifts (Others) valued at today's gold rate, added to the moi total. Weights are read as grams. */
const GoldValueDialog = ({ open, onClose }) => {
  const tx = useTx();
  const { t } = useTranslation();
  const user = readUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [rate, setRate] = useState('');
  const [unit, setUnit] = useState('g');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setData(null);
    setError('');
    if (!user.functionId) {
      setError(tx('Choose one of your functions first.'));
      return;
    }
    getGold(user.functionId).then((r) => {
      if (r.ok) {
        setData(r.data);
        setRate(r.data.rate ? String(r.data.rate) : '');
      } else setError(tx(r.message));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = async () => {
    setBusy(true);
    const r = await setGoldRate(user.functionId, rate === '' ? null : Number(rate));
    setBusy(false);
    if (r.ok) {
      setData(r.data);
      notify.success(tx('Saved'));
    } else notify.error(tx(r.message));
  };

  const w = (g) => (unit === 'g' ? `${Number(g).toLocaleString('en-IN')} g` : `${(Number(g) / PAVUN).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ${tx('pavun')}`);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={800}>{tx('Gold value')}</Typography>
          <ToggleButtonGroup size="small" exclusive value={unit} onChange={(e, v) => v && setUnit(v)}>
            <ToggleButton value="g">{tx('grams')}</ToggleButton>
            <ToggleButton value="p">{tx('pavun')}</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{tx('Gold gifts in Others are valued at the gold rate you set, using the weight in grams typed for each gift.')}</Typography>
        {error ? <Alert severity="warning">{error}</Alert> : !data ? <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box> : (
          <Stack spacing={1.5}>
            {data.canChange && (
              <Stack direction="row" spacing={1}>
                <TextField size="small" fullWidth label={tx('Gold rate per gram')} value={rate} onChange={(e) => setRate(e.target.value.replace(/[^\d.]/g, ''))}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} />
                <Button variant="contained" disabled={busy} onClick={save}>{tx('Save')}</Button>
              </Stack>
            )}
            {data.items.length === 0 ? <Typography color="text.secondary">{tx('No gold or other gifts recorded yet.')}</Typography> : data.items.map((i) => (
              <Stack key={i.type || '-'} direction="row" spacing={1} alignItems="center">
                <Typography sx={{ flex: 1 }}>{t(i.type || 'others')} <Typography component="span" variant="body2" color="text.secondary">× {i.count}</Typography></Typography>
                <Typography variant="body2">{i.gold && i.weight > 0 ? w(i.weight) : ''}</Typography>
                <Typography fontWeight={700} sx={{ minWidth: 90, textAlign: 'right' }}>{i.gold ? (data.rate ? rupees(i.value) : '—') : ''}</Typography>
              </Stack>
            ))}
            <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
              <Stack direction="row"><Typography sx={{ flex: 1 }}>{tx('Moi (cash and online)')}</Typography><Typography fontWeight={700}>{rupees(data.moi)}</Typography></Stack>
              <Stack direction="row"><Typography sx={{ flex: 1 }}>{tx('Gold')} ({w(data.goldWeight)})</Typography><Typography fontWeight={700}>{data.rate ? rupees(data.goldValue) : '—'}</Typography></Stack>
              <Stack direction="row" sx={{ mt: 1 }}><Typography sx={{ flex: 1 }} fontWeight={800}>{tx('Total with gold')}</Typography><Typography variant="h6" fontWeight={800}>{rupees(data.total)}</Typography></Stack>
              {!data.rate && <Typography variant="caption" color="text.secondary">{tx('Set the gold rate to see the value.')}</Typography>}
              {data.unweighed > 0 && (
                <Typography variant="caption" color="warning.main" display="block">
                  {tx('{{n}} gold gifts were recorded without a weight, so they are not valued.', { n: data.unweighed })}
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={onClose}>{tx('Close')}</Button></DialogActions>
    </Dialog>
  );
};

export default GoldValueDialog;
