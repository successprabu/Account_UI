import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, Stack, TextField, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { getLiveShare, setLiveShare } from '../../api/family';
import { notify } from '../ui';
import { useTx } from '../../language/site';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    return {};
  }
};

/** Owner sets a PIN and shares a read-only live totals link with family abroad or elders at home. */
const FamilyLinkDialog = ({ open, onClose }) => {
  const tx = useTx();
  const user = readUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setData(null);
    setError('');
    setPin('');
    if (!user.functionId) {
      setError(tx('Choose one of your functions first.'));
      return;
    }
    getLiveShare(user.functionId).then((r) => (r.ok ? setData(r.data) : setError(tx(r.message))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const save = async (off = false) => {
    if (!off && !/^\d{4,6}$/.test(pin)) {
      notify.error(tx('The PIN must be 4 to 6 digits.'));
      return;
    }
    setBusy(true);
    const r = await setLiveShare({ functionId: user.functionId, pin: off ? null : pin, off });
    setBusy(false);
    if (r.ok) {
      setData((d) => ({ ...d, ...r.data }));
      setPin('');
      notify.success(tx(r.message));
    } else notify.error(tx(r.message));
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.url);
      notify.success(tx('Link copied'));
    } catch (e) {
      notify.error(data.url);
    }
  };

  const share = () => {
    const text = `${data.functionName}: ${tx('See the moi totals live')} ${data.url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ pt: 3 }}>
        <Typography variant="h6" fontWeight={800}>{tx('Family live link')}</Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {tx('Family abroad or elders at home can see the total, the count and the latest gifts as they come in. They need the PIN to open it.')}
        </Typography>
        {error ? <Alert severity="warning">{error}</Alert> : !data ? <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box> : (
          <Stack spacing={2}>
            {data.enabled ? (
              <>
                <Alert severity="success" icon={false} sx={{ wordBreak: 'break-all' }}>{data.url}</Alert>
                <Stack direction="row" spacing={1}>
                  <Button startIcon={<ContentCopyIcon />} onClick={copy}>{tx('Copy link')}</Button>
                  <Button startIcon={<WhatsAppIcon />} color="success" onClick={share}>{tx('Share on WhatsApp')}</Button>
                </Stack>
                <Typography variant="caption" color="text.secondary">{tx('Send the PIN separately, by call or message.')}</Typography>
              </>
            ) : (
              <Alert severity="info">{tx('Not shared yet. Set a PIN to make the link.')}</Alert>
            )}
            {data.canChange ? (
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <TextField size="small" label={tx(data.enabled ? 'New PIN' : 'PIN (4 to 6 digits)')} value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputProps={{ inputMode: 'numeric' }} sx={{ flex: 1 }} />
                <Button variant="contained" disabled={busy} onClick={() => save(false)}>{tx(data.enabled ? 'Change PIN' : 'Make link')}</Button>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">{tx('Only the account owner can change the family link.')}</Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        {data?.enabled && data.canChange ? <Button color="error" size="small" disabled={busy} onClick={() => save(true)}>{tx('Turn off link')}</Button> : <span />}
        <Button onClick={onClose}>{tx('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FamilyLinkDialog;
