import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Stack, Typography,
} from '@mui/material';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { cancelAutoPay } from '../../api/autoPay';
import { useTx } from '../../language/site';
import { notify } from '../ui';
import { autoPayIsOn, planName, productFor, renewLink, usePlanInfo } from '../billing/planInfo';

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('user')) || {}; } catch (e) { return {}; }
};
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

/** Owner's plan: what they have, when it ends, AutoPay, and buttons to renew. */
const MyPlan = () => {
  const tx = useTx();
  const product = productFor(readUser().userType);
  const { loading, sub, autoPay, days, reload } = usePlanInfo();
  const [stopping, setStopping] = useState(false);
  const auto = autoPayIsOn(autoPay);
  const ended = days !== null && days < 0;

  const stop = async () => {
    setStopping(true);
    const r = await cancelAutoPay();
    setStopping(false);
    if (r.ok) {
      notify.success(tx('AutoPay stopped. Your plan stays on until the end of this period.'));
      reload();
    } else notify.error(r.message || tx('Could not stop AutoPay. Please try again.'));
  };

  const row = (label, value) => (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 1 }}>
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={700} textAlign="right">{value}</Typography>
    </Stack>
  );

  let status = <Chip size="small" label={tx('No plan yet')} />;
  if (sub && ended) status = <Chip size="small" color="error" label={tx('Ended')} />;
  else if (sub && days !== null && days <= 7) status = <Chip size="small" color="warning" label={tx('Ends soon')} />;
  else if (sub) status = <Chip size="small" color="success" label={tx('Active')} />;

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={800}>{tx('My plan & billing')}</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>{tx('See your plan, renew it, or turn on AutoPay so it renews by itself.')}</Typography>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
      ) : (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <WorkspacePremiumOutlinedIcon color="primary" />
              <Typography variant="h6" fontWeight={800} sx={{ flex: 1 }}>{sub ? tx(planName(sub.plan)) : tx('No plan yet')}</Typography>
              {status}
            </Stack>
            <Divider />
            {row(tx('Billing'), sub ? tx(sub.billingCycle === 'yearly' ? 'Yearly' : 'Monthly') : '—')}
            {row(ended ? tx('Ended on') : tx('Valid till'), fmtDate(sub?.endDate))}
            {sub && days !== null && !ended && row(tx('Days left'), days)}
            {row(tx('AutoPay'), auto ? tx('On') : tx('Off'))}

            {auto && (
              <Alert severity="success" icon={<AutorenewIcon />} sx={{ mt: 2 }}>
                {tx('AutoPay is on. Your plan renews by itself.')}
              </Alert>
            )}
            {!auto && ended && <Alert severity="error" sx={{ mt: 2 }}>{tx('Your plan has ended. Renew now to keep using all features.')}</Alert>}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
              {!auto && (
                <>
                  <Button variant="contained" startIcon={<CreditCardIcon />} component={RouterLink} to={renewLink(product, sub, 'once')}>{tx('Renew now')}</Button>
                  <Button variant="outlined" startIcon={<AutorenewIcon />} component={RouterLink} to={renewLink(product, sub, 'auto')}>{tx('Turn on AutoPay')}</Button>
                </>
              )}
              {auto && <Button color="error" variant="outlined" disabled={stopping} onClick={stop}>{tx('Stop AutoPay')}</Button>}
              <Button component={RouterLink} to={`/pricing?product=${product}`}>{tx('See all plans')}</Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MyPlan;
