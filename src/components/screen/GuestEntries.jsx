import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Alert, Box, Button, Card, Chip, Container, InputAdornment, Skeleton, Stack, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { decideGuestEntry, listGuestEntries } from '../../api/guestEntry';
import GuestQrDialog from '../moitech/GuestQrDialog';
import { rupees } from '../moitech/shared';
import { EmptyState, notify } from '../ui';
import { useTx } from '../../language/site';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    return {};
  }
};
const time = (d) => new Date(d.endsWith?.('Z') ? d : `${d}Z`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

/** One waiting entry: check (and fix) what the guest typed, then Accept or Reject. */
const EntryCard = ({ e, index, onDone }) => {
  const tx = useTx();
  const [f, setF] = useState({ villageName: e.villageName, name: e.name, initial: e.initial || '', amount: String(e.amount), payMode: e.payMode });
  const [busy, setBusy] = useState('');
  const decide = async (accept) => {
    if (accept && !(Number(f.amount) > 0)) {
      notify.error(tx('Please enter the moi amount.'));
      return;
    }
    setBusy(accept ? 'a' : 'r');
    const r = await decideGuestEntry({ id: e.id, accept, ...f, amount: Number(f.amount) });
    setBusy('');
    if (r.ok) {
      notify.success(tx(r.message));
      onDone(e.id);
    } else if (r.data?.code !== 'plan_required') notify.error(tx(r.message));
  };
  return (
    <Card sx={{ p: 2 }} component={motion.div} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 8) * 0.03 } }} exit={{ opacity: 0 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
        <TextField size="small" label={tx('Place')} value={f.villageName} onChange={(ev) => setF({ ...f, villageName: ev.target.value })} sx={{ flex: 1.2 }} />
        <TextField size="small" label={tx('Initial')} value={f.initial} onChange={(ev) => setF({ ...f, initial: ev.target.value })} sx={{ width: { md: 90 } }} />
        <TextField size="small" label={tx('Name')} value={f.name} onChange={(ev) => setF({ ...f, name: ev.target.value })} sx={{ flex: 1.4 }} />
        <TextField size="small" label={tx('Amount')} value={f.amount} onChange={(ev) => setF({ ...f, amount: ev.target.value.replace(/[^\d.]/g, '') })}
          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'decimal' }} sx={{ width: { md: 140 } }} />
        <ToggleButtonGroup size="small" exclusive value={f.payMode} onChange={(ev, v) => v && setF({ ...f, payMode: v })}>
          <ToggleButton value="Cash">{tx('Cash')}</ToggleButton>
          <ToggleButton value="Online" color="success">{tx('Online')}</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {time(e.createdDt)}{e.phoneNo ? ` · ${e.phoneNo}` : ''}{e.note ? ` · ${e.note}` : ''}
          {f.payMode === 'Online' ? ` · ${tx('Check the UPI payment on the family phone before accepting.')}` : ''}
        </Typography>
        <Button color="error" startIcon={<CloseIcon />} disabled={!!busy} onClick={() => decide(false)}>{tx('Reject')}</Button>
        <Button variant="contained" color="success" startIcon={<CheckIcon />} disabled={!!busy} onClick={() => decide(true)}>{tx('Accept')}</Button>
      </Stack>
    </Card>
  );
};

/** Helpers: moi that guests typed in by scanning the QR, waiting to be accepted as receipts. Refreshes every 10 seconds. */
const GuestEntries = () => {
  const tx = useTx();
  const user = readUser();
  const [tab, setTab] = useState('Pending');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [qr, setQr] = useState(false);

  const load = useCallback(async () => {
    if (!user.functionId) {
      setError(tx('Choose one of your functions first.'));
      setData({ items: [], pending: 0, accepted: 0, rejected: 0 });
      return;
    }
    const r = await listGuestEntries(user.functionId, tab);
    if (r.ok && Array.isArray(r.data?.items)) {
      setData(r.data);
      setError('');
    } else if (!r.ok) {
      setError(tx(r.message));
      setData((d) => d || { items: [], pending: 0, accepted: 0, rejected: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user.functionId, tx]);

  useEffect(() => {
    setData(null);
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [load]);

  const done = (id) => setData((d) => ({ ...d, items: d.items.filter((x) => x.id !== id), pending: Math.max(0, d.pending - 1) }));

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Guest entries')}</Typography>
          <Typography color="text.secondary">{tx('Moi that guests typed in by scanning the QR. Check each one, fix spelling if needed, and accept it as a receipt.')}</Typography>
        </Box>
        <Button variant="contained" startIcon={<QrCode2Icon />} onClick={() => setQr(true)} sx={{ flexShrink: 0 }}>{tx('Show guest QR')}</Button>
      </Stack>
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="Pending" label={<Stack direction="row" spacing={1} alignItems="center"><span>{tx('Waiting')}</span>{data?.pending > 0 && <Chip size="small" color="warning" label={data.pending} />}</Stack>} />
        <Tab value="Accepted" label={tx('Accepted')} />
        <Tab value="Rejected" label={tx('Rejected')} />
      </Tabs>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {!data ? (
        <Stack spacing={1.5}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={96} />)}</Stack>
      ) : data.items.length === 0 ? (
        <Card><EmptyState icon={<PeopleOutlineIcon />} title={tx(tab === 'Pending' ? 'No guest entries waiting' : 'Nothing here yet')}
          description={tx('Print the guest QR and keep it at the moi counter. Entries appear here as guests send them.')} /></Card>
      ) : tab === 'Pending' ? (
        <Stack spacing={1.5}>{data.items.map((e, i) => <EntryCard key={e.id} e={e} index={i} onDone={done} />)}</Stack>
      ) : (
        <Card>
          {data.items.map((e, i) => (
            <Stack key={e.id} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.25, borderBottom: i < data.items.length - 1 ? 1 : 0, borderColor: 'divider' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>{[e.initial, e.name].filter(Boolean).join('. ')}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{e.villageName} · {e.decidedBy || ''}</Typography>
              </Box>
              {e.payMode === 'Online' && <Chip size="small" variant="outlined" color="success" label={tx('Online')} />}
              <Typography fontWeight={800}>{rupees(e.amount)}</Typography>
            </Stack>
          ))}
        </Card>
      )}
      <GuestQrDialog open={qr} onClose={() => setQr(false)} />
    </Container>
  );
};

export default GuestEntries;
