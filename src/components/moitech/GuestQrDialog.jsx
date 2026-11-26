import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, Stack, Typography } from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getGuestQr, resetGuestQr } from '../../api/guestEntry';
import { notify } from '../ui';
import { useTx } from '../../language/site';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    return {};
  }
};

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** QR for guests to type in their own moi at the counter (current function). Print it as an A4 poster. */
const GuestQrDialog = ({ open, onClose }) => {
  const tx = useTx();
  const user = readUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setData(null);
    setError('');
    if (!user.functionId) {
      setError(tx('Choose one of your functions first.'));
      return;
    }
    getGuestQr(user.functionId).then((r) => (r.ok ? setData(r.data) : setError(tx(r.message))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.url);
      notify.success(tx('Link copied'));
    } catch (e) {
      notify.error(data.url);
    }
  };

  const reset = async () => {
    if (!window.confirm(tx('Make a new QR? The old QR and its printed copies will stop working.'))) return;
    const r = await resetGuestQr(user.functionId);
    if (r.ok) {
      setData(r.data);
      notify.success(tx(r.message));
    } else notify.error(tx(r.message));
  };

  // A4 poster to stand at the moi counter.
  const print = () => {
    const svg = document.getElementById('guest-qr-svg')?.outerHTML || '';
    const w = window.open('', '_blank');
    if (!w) {
      notify.error(tx('Allow pop-ups for this site to open the report.'));
      return;
    }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(data.functionName)}</title><style>
      @page{size:A4;margin:16mm} body{font-family:"Noto Sans Tamil",system-ui,sans-serif;text-align:center;color:#0f172a}
      h1{font-size:30px;margin:10px 0 4px} .names{font-size:20px;color:#475569} svg{width:110mm;height:110mm;margin:24px auto;display:block}
      .big{font-size:26px;font-weight:800;margin-top:6px} .ta{font-size:22px;margin-top:6px} .foot{margin-top:28px;color:#64748b;font-size:13px}
    </style></head><body><h1>${esc(data.functionName)}</h1><div class="names">${esc(data.funPersionNames || '')}</div>${svg}
      <div class="big">Scan to write your moi</div><div class="ta">மொய் எழுத ஸ்கேன் செய்யுங்கள்</div>
      <div class="foot">DigiMoi · mysuccess.azurewebsites.net</div><script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
    w.document.close();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        {error ? <Alert severity="warning">{error}</Alert> : !data ? <CircularProgress /> : (
          <>
            <Typography variant="h6" fontWeight={800}>{data.functionName}</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>{tx('Guests scan this and type in their own moi. A helper accepts each entry.')}</Typography>
            <Box sx={{ display: 'inline-block', p: 2, bgcolor: '#fff', borderRadius: 3, boxShadow: 3 }}>
              <QRCodeSVG id="guest-qr-svg" value={data.url} size={240} level="M" />
            </Box>
            <Typography variant="body2" sx={{ mt: 1.5, wordBreak: 'break-all' }} color="text.secondary">{data.url}</Typography>
            {data.pending > 0 && <Alert severity="info" sx={{ mt: 2, textAlign: 'left' }}>{tx('{{n}} guest entries are waiting for a helper.', { n: data.pending })}</Alert>}
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              <Button startIcon={<PrintOutlinedIcon />} variant="contained" onClick={print}>{tx('Print poster')}</Button>
              <Button startIcon={<ContentCopyIcon />} onClick={copy}>{tx('Copy link')}</Button>
            </Stack>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        {data && user.userType !== 'NU' ? <Button color="inherit" size="small" onClick={reset}>{tx('New QR')}</Button> : <span />}
        <Button onClick={onClose}>{tx('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GuestQrDialog;
