import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Link, Stack, Switch, TextField, Typography,
} from '@mui/material';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import { saveBilling } from '../../api/mahalOps';
import { notify } from '../ui';
import { useTx } from '../../language/site';

/**
 * GST invoice details and online advance payment for one hall. Payments go straight to the hall's own Razorpay
 * account: the owner pastes the Key Id and Key Secret from the Razorpay dashboard. The secret is stored encrypted
 * and never shown again.
 */
const BillingDialog = ({ open, mahal, onClose, onSaved }) => {
  const tx = useTx();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !mahal) return;
    setForm({
      mahalId: mahal.id,
      gstEnabled: !!mahal.gstEnabled,
      gstin: mahal.gstin || '',
      gstRate: mahal.gstRate ?? 18,
      payOnline: !!mahal.payOnline,
      razorpayKeyId: mahal.razorpayKeyId || '',
      razorpayKeySecret: '',
    });
  }, [open, mahal]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await saveBilling({ ...form, gstRate: Number(form.gstRate) || 18 });
    setSaving(false);
    if (res.ok) {
      notify.success(tx(res.message));
      onSaved({ ...mahal, ...res.data });
    } else notify.error(tx(res.message));
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth PaperProps={{ component: 'form', onSubmit: submit, noValidate: true }}>
      <DialogTitle>{tx('Billing and online payment')} · {mahal?.mahalName}</DialogTitle>
      {form && (
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center"><ReceiptOutlinedIcon color="primary" /><Typography fontWeight={700}>{tx('GST invoice')}</Typography></Stack>
              <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={form.gstEnabled} onChange={set('gstEnabled')} />} label={tx('Show GST on invoices')} />
              <Collapse in={form.gstEnabled}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                  <TextField label="GSTIN" value={form.gstin} onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase().slice(0, 15) }))} placeholder="33ABCDE1234F1Z5" sx={{ flex: 1 }} />
                  <TextField label={tx('GST %')} value={form.gstRate} onChange={(e) => setForm((f) => ({ ...f, gstRate: e.target.value.replace(/[^\d.]/g, '') }))} sx={{ width: 110 }} inputProps={{ inputMode: 'decimal' }} />
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  {tx('Your rent is taken as including GST. The invoice splits it into taxable value, CGST and SGST.')}
                </Typography>
              </Collapse>
            </Card>

            <Card variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center"><CreditCardOutlinedIcon color="primary" /><Typography fontWeight={700}>{tx('Take the advance online')}</Typography></Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {tx('Customers pay by UPI, card or net banking on the booking status page. Money goes straight to your own Razorpay account, and the booking is confirmed when they pay.')}
              </Typography>
              <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={form.payOnline} onChange={set('payOnline')} />} label={tx('Customers can pay online')} />
              <Collapse in={form.payOnline}>
                <Stack spacing={2} sx={{ mt: 1 }}>
                  <TextField label="Razorpay Key Id" value={form.razorpayKeyId} onChange={set('razorpayKeyId')} placeholder="rzp_live_..." />
                  <TextField label="Razorpay Key Secret" type="password" value={form.razorpayKeySecret} onChange={set('razorpayKeySecret')} autoComplete="off"
                    helperText={tx(mahal?.hasRazorpaySecret ? 'Saved. Leave empty to keep it.' : 'Stored encrypted. It is never shown again.')} />
                  <Alert severity="info" icon={false}>
                    <Box component="span">{tx('Get these from the Razorpay dashboard: Account & Settings → API keys.')} </Box>
                    <Link href="https://dashboard.razorpay.com/app/website-app-settings/api-keys" target="_blank" rel="noopener noreferrer">dashboard.razorpay.com</Link>
                  </Alert>
                </Stack>
              </Collapse>
            </Card>
          </Stack>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving}>{tx('Close')}</Button>
        <Button type="submit" variant="contained" disabled={saving}>{tx('Save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BillingDialog;
