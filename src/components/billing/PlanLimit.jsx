import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Stack, Typography } from '@mui/material';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { auth, call } from '../../api/mahal';
import { useTx } from '../../language/site';
import { buyFunctionPass } from '../../api/moiPlus';
import { notify } from '../ui';

const EVENT = 'mysuccess:plan-limit';

/** Plan status of the signed-in Moitech account: { plan, paid, endDate, daysLeft, receipts, receiptLimit, grace, canAddEntries, canAddReceipts, reason }. */
export const getPlanStatus = () => call({ method: 'get', url: 'Plan/Status', headers: auth() });

// Any API answer refused for plan reasons (code "plan_required") opens the dialog, on every screen.
axios?.interceptors?.response?.use?.(
  (res) => {
    if (res?.data?.result === false && res.data?.data?.code === 'plan_required') window.dispatchEvent(new CustomEvent(EVENT, { detail: res.data }));
    return res;
  },
  (err) => {
    const body = err?.response?.data;
    if (body?.data?.code === 'plan_required') window.dispatchEvent(new CustomEvent(EVENT, { detail: body }));
    return Promise.reject(err);
  },
);

/** Mounted once in the app shell: explains why an entry was not saved and offers a plan. */
export const PlanLimitDialog = () => {
  const tx = useTx();
  const [info, setInfo] = useState(null);
  useEffect(() => {
    const on = (e) => setInfo(e.detail);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const d = info?.data || {};
  const [buying, setBuying] = useState(false);
  const canPass = d.functionId > 0 && d.passPrice > 0 && d.reason !== 'paid_feature';
  const buyPass = async () => {
    setBuying(true);
    const r = await buyFunctionPass(d.functionId);
    setBuying(false);
    if (r.ok) {
      notify.success(tx(r.message));
      setInfo(null);
    } else if (!r.cancelled) notify.error(tx(r.message));
  };
  return (
    <Dialog open={!!info} onClose={() => setInfo(null)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WorkspacePremiumOutlinedIcon color="primary" />
        {tx(d.reason === 'receipt_limit' ? 'Free receipts used up' : d.reason === 'plan_ended' ? 'Your plan has ended' : 'Your free trial has ended')}
      </DialogTitle>
      <DialogContent>
        <Typography>{tx(info?.message || '')}</Typography>
        {d.receiptLimit > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{tx('{{n}} of {{limit}} free receipts used', { n: d.receipts, limit: d.receiptLimit })}</Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{tx('Standard ₹99/month or Premium ₹199/month: unlimited receipts for all your functions.')}</Typography>
        {canPass && (
          <Alert severity="info" icon={false} sx={{ mt: 2 }}
            action={<Button color="inherit" size="small" variant="outlined" disabled={buying} onClick={buyPass}>{tx('Pay ₹{{n}}', { n: d.passPrice })}</Button>}>
            <Typography variant="body2" fontWeight={700}>{tx('Only one function this year?')}</Typography>
            <Typography variant="body2">{tx('Pay once for this function: unlimited entries until 60 days after the function.')}</Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={() => setInfo(null)}>{tx('Close')}</Button>
        <Button variant="contained" component={RouterLink} to="/pricing?product=moitech" onClick={() => setInfo(null)}>{tx('Choose a plan')}</Button>
      </DialogActions>
    </Dialog>
  );
};

/** Moitech dashboard banner: trial days and receipts left, or that new entries are paused. Hidden on paid plans with time left. */
export const MoitechPlanBanner = () => {
  const tx = useTx();
  const [s, setS] = useState(null);
  useEffect(() => {
    getPlanStatus().then((r) => r.ok && typeof r.data?.plan === 'string' && setS(r.data));
  }, []);
  if (!s) return null;
  const blocked = !s.canAddReceipts || !s.canAddEntries;
  if (s.paid && !blocked && s.daysLeft > 7) return null;

  let text;
  if (blocked) text = s.reason === 'receipt_limit' ? tx('Free receipts used up') : tx(s.reason === 'plan_ended' ? 'Your plan has ended' : 'Your free trial has ended');
  else if (s.paid) text = tx('Your plan ends in {{n}} days.', { n: s.daysLeft });
  else if (s.grace) text = tx('Free until {{date}}. Choose a plan to keep using Moitech after that.', { date: new Date(s.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) });
  else text = tx('Free trial: {{n}} days left · {{used}} of {{limit}} receipts used', { n: s.daysLeft, used: s.receipts, limit: s.receiptLimit });

  return (
    <Alert
      severity={blocked ? 'error' : 'info'}
      icon={<WorkspacePremiumOutlinedIcon />}
      sx={{ mb: 2 }}
      action={<Button color="inherit" size="small" component={RouterLink} to="/pricing?product=moitech">{tx(s.paid ? 'Renew now' : 'Choose a plan')}</Button>}
    >
      <Box component="span" sx={{ fontWeight: 600 }}>{text}</Box>
      {blocked && <Typography variant="body2">{tx('New entries are paused. Your saved receipts and reports stay as they are.')}</Typography>}
      {!blocked && !s.paid && s.receiptLimit > 0 && (
        <Stack sx={{ mt: 0.75, maxWidth: 320 }}><LinearProgress variant="determinate" value={Math.min(100, (s.receipts / s.receiptLimit) * 100)} /></Stack>
      )}
    </Alert>
  );
};
