import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, Stack, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { API_SERVICE } from '../common/CommonMethod';
import { LIST_FUNCTION_API } from '../common/CommonApiURL';
import { useTx } from '../../language/site';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

/** upi://pay link guests' UPI apps open from the QR (amount left for the guest to type). */
export const upiLink = (upiId, name, note) =>
  `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(name || '')}&cu=INR${note ? `&tn=${encodeURIComponent(note)}` : ''}`;

/** The current function (from the saved user's functionId), with its family UPI ID if set. */
export const useCurrentFunction = () => {
  const [fn, setFn] = useState(null);
  useEffect(() => {
    const u = readUser();
    if (!u?.functionId) return;
    let live = true;
    API_SERVICE.get(LIST_FUNCTION_API, { id: u.functionId, customer_id: u.customerID, function_name: '', current_page: 1, page_size: 50 })
      .then((r) => {
        const list = r?.data?.data?.functions || [];
        if (live) setFn(list.find((f) => f.id === u.functionId) || null);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return fn;
};

/**
 * Cash or Online for one moi receipt. Online = the guest paid the family's UPI directly, so the helper did not
 * receive it and it is left out of their hand-over. When the function has a UPI ID, "Show QR" puts a big QR on screen.
 */
const PayModeToggle = ({ value, onChange, fn }) => {
  const tx = useTx();
  const [qr, setQr] = useState(false);
  const mode = value === 'Online' ? 'Online' : 'Cash';

  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <ToggleButtonGroup exclusive size="small" value={mode} onChange={(e, v) => v && onChange(v)} aria-label={tx('How was it given?')}>
        <ToggleButton value="Cash" sx={{ px: 2, fontWeight: 700 }}><PaymentsOutlinedIcon fontSize="small" sx={{ mr: 0.75 }} />{tx('Cash')}</ToggleButton>
        <ToggleButton value="Online" color="success" sx={{ px: 2, fontWeight: 700 }}><PhoneAndroidIcon fontSize="small" sx={{ mr: 0.75 }} />{tx('Online (UPI)')}</ToggleButton>
      </ToggleButtonGroup>
      {fn?.upiId && (
        <Button size="small" startIcon={<QrCode2Icon />} onClick={() => setQr(true)}>{tx('Show UPI QR')}</Button>
      )}

      <Dialog open={qr} onClose={() => setQr(false)} maxWidth="xs" fullWidth>
        <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
          <Typography variant="h6" fontWeight={800}>{fn?.upiName || fn?.funPersionNames || fn?.functionName}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>{tx('Scan with any UPI app to give moi')}</Typography>
          {fn?.upiId && (
            <Box sx={{ display: 'inline-block', p: 2, bgcolor: '#fff', borderRadius: 3, boxShadow: 3 }}>
              <QRCodeSVG value={upiLink(fn.upiId, fn.upiName || fn.funPersionNames, fn.functionName)} size={240} level="M" includeMargin={false} />
            </Box>
          )}
          <Typography fontWeight={700} sx={{ mt: 2, letterSpacing: 0.5 }}>{fn?.upiId}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{tx('After the guest pays, check the amount on their phone, then save the receipt as Online.')}</Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant="contained" color="success" onClick={() => { onChange('Online'); setQr(false); }}>{tx('Paid, mark as Online')}</Button>
          <Button onClick={() => setQr(false)}>{tx('Close')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default PayModeToggle;
