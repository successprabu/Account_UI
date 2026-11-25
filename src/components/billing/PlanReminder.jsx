import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button } from '@mui/material';
import { useTx } from '../../language/site';
import { autoPayIsOn, productFor, renewLink, usePlanInfo } from './planInfo';

/** Dashboard banner for owners from 7 days before the plan ends (hidden while AutoPay is on). */
const PlanReminder = ({ userType }) => {
  const tx = useTx();
  const { loading, sub, autoPay, days } = usePlanInfo();
  if (loading || !sub || days === null || days > 7 || autoPayIsOn(autoPay)) return null;
  const date = new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return (
    <Alert
      severity={days < 0 ? 'error' : 'warning'}
      sx={{ mb: 2 }}
      action={<Button color="inherit" size="small" component={RouterLink} to={renewLink(productFor(userType), sub, 'once')}>{tx('Renew now')}</Button>}
    >
      {days < 0 ? tx('Your plan ended on {{date}}.', { date }) : tx('Your plan ends on {{date}}.', { date })}{' '}
      <RouterLink to="/my-plan">{tx('Turn on AutoPay')}</RouterLink>
    </Alert>
  );
};

export default PlanReminder;
