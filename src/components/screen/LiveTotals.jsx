import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert, Box, Button, Card, Chip, CircularProgress, Container, Grid, Stack, TextField, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AppHeader from '../common/AppHeader';
import { getLiveTotals } from '../../api/family';
import { AnimatedNumber, rupees } from '../moitech/shared';
import { useTx } from '../../language/site';

const time = (d) => new Date(String(d).endsWith('Z') ? d : `${d}Z`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const pinKey = (token) => `moitech.live.${token}`;

/** Public, read-only: the family's live moi totals behind a link + PIN. Refreshes every 30 seconds. */
const LiveTotals = () => {
  const tx = useTx();
  const { token } = useParams();
  const [pin, setPin] = useState(() => {
    try {
      return sessionStorage.getItem(pinKey(token)) || '';
    } catch (e) {
      return '';
    }
  });
  const [typed, setTyped] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [inactive, setInactive] = useState(false);
  const timer = useRef(null);

  const load = useCallback(async (p) => {
    const r = await getLiveTotals(token, p);
    if (r.ok) {
      setData(r.data);
      setError('');
      if (p && !r.data.needPin) {
        try {
          sessionStorage.setItem(pinKey(token), p);
        } catch (e) { /* private mode */ }
      }
    } else {
      setError(tx(r.message));
      if (!p) setInactive(true);
      if (p) {
        setPin('');
        try {
          sessionStorage.removeItem(pinKey(token));
        } catch (e) { /* private mode */ }
      }
    }
    return r.ok;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    document.title = 'Moi live';
    load(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    clearInterval(timer.current);
    if (pin && data && !data.needPin) timer.current = setInterval(() => load(pin), 30000);
    return () => clearInterval(timer.current);
  }, [pin, data, load]);

  const open = async (e) => {
    e.preventDefault();
    setBusy(true);
    const ok = await load(typed);
    setBusy(false);
    if (ok) setPin(typed);
  };

  const locked = !data || data.needPin || !pin;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader />
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        {!data && !error ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box> : locked ? (
          <Card sx={{ p: { xs: 3, md: 4 }, maxWidth: 420, mx: 'auto', textAlign: 'center' }} component="form" onSubmit={open}>
            <LockOutlinedIcon color="primary" sx={{ fontSize: 44 }} />
            {data?.functionName && <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>{data.functionName}</Typography>}
            {data?.funPersionNames && <Typography color="text.secondary">{data.funPersionNames}</Typography>}
            <Typography sx={{ mt: 2, mb: 2 }}>{tx('Enter the PIN the family gave you to see the moi totals.')}</Typography>
            {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}
            {!inactive && (
              <>
                <TextField autoFocus fullWidth label="PIN" value={typed} onChange={(e) => setTyped(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{ inputMode: 'numeric', style: { textAlign: 'center', fontSize: 24, letterSpacing: 8 } }} />
                <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 2 }} disabled={busy || typed.length < 4}>{tx('Open')}</Button>
              </>
            )}
          </Card>
        ) : (
          <>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={800}>{data.functionName}</Typography>
                {data.funPersionNames && <Typography color="text.secondary">{data.funPersionNames}</Typography>}
              </Box>
              <Chip color="success" size="small" label={`● ${tx('Live')} · ${time(data.at)}`} />
            </Stack>
            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
            <Card sx={{ p: 3, mb: 2, textAlign: 'center', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff' }}>
              <Typography sx={{ opacity: 0.9 }}>{tx('Total moi')}</Typography>
              <Typography variant="h3" fontWeight={800}><AnimatedNumber value={data.total} /></Typography>
              <Typography sx={{ opacity: 0.9 }}>{tx('{{n}} givers', { n: data.count.toLocaleString('en-IN') })}{data.lastHour ? ` · ${tx('{{n}} in the last hour', { n: data.lastHour })}` : ''}</Typography>
            </Card>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[['Cash', data.cash], ['Online', data.online], ['Expenses', data.expenses]].map(([k, v]) => (
                <Grid item xs={4} key={k}>
                  <Card sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">{tx(k)}</Typography>
                    <Typography variant="h6" fontWeight={800}>{rupees(v)}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <Card>
                  <Typography fontWeight={800} sx={{ px: 2, pt: 2, pb: 1 }}>{tx('Latest gifts')}</Typography>
                  <AnimatePresence initial={false}>
                    {data.latest.map((e) => (
                      <Stack key={e.id} component={motion.div} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography fontWeight={700} noWrap>{[e.initial, e.name].filter(Boolean).join('. ')}</Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>{e.villageName} · {time(e.createdDt)}</Typography>
                        </Box>
                        <Typography fontWeight={800}>{rupees(e.amount)}</Typography>
                      </Stack>
                    ))}
                  </AnimatePresence>
                </Card>
              </Grid>
              <Grid item xs={12} md={5}>
                <Card>
                  <Typography fontWeight={800} sx={{ px: 2, pt: 2, pb: 1 }}>{tx('Top places')}</Typography>
                  {data.villages.map((v) => (
                    <Stack key={v.village} direction="row" sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography sx={{ flex: 1 }} noWrap>{v.village} <Typography component="span" variant="body2" color="text.secondary">({v.count})</Typography></Typography>
                      <Typography fontWeight={700}>{rupees(v.amount)}</Typography>
                    </Stack>
                  ))}
                </Card>
              </Grid>
            </Grid>
            <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 3 }}>
              {tx('Updates every 30 seconds. Recorded with Moitech.')}
            </Typography>
          </>
        )}
      </Container>
    </Box>
  );
};

export default LiveTotals;
