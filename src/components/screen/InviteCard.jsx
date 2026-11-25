import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Alert, Box, Button, Card, CircularProgress, Container, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AppHeader from '../common/AppHeader';
import { getInviteCard, sendRsvp } from '../../api/moiPlus';
import { useTx } from '../../language/site';

const day = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '');
const empty = { name: '', phone: '', place: '', coming: true, guests: 2, note: '', website: '' };

/** Public: the function invitation a guest opens from WhatsApp, with a coming / not coming reply. */
const InviteCard = () => {
  const tx = useTx();
  const { token } = useParams();
  const [card, setCard] = useState(null);
  const [error, setError] = useState('');
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    getInviteCard(token).then((r) => {
      if (r.ok) {
        setCard(r.data);
        document.title = r.data.functionName;
      } else setError(tx(r.message));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSendError('');
    if (f.name.trim().length < 2) return setSendError(tx('Please enter your name.'));
    if (f.phone.replace(/\D/g, '').length < 10) return setSendError(tx('Please enter your 10 digit mobile number.'));
    setBusy(true);
    const r = await sendRsvp({ ...f, token, guests: Number(f.guests) || 1 });
    setBusy(false);
    if (r.ok) setDone(r.message);
    else setSendError(tx(r.message));
    return undefined;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader />
      <Container maxWidth="sm" sx={{ py: { xs: 3, md: 6 } }}>
        {error ? <Alert severity="warning">{error}</Alert> : !card ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box> : (
          <Card sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', background: 'linear-gradient(135deg,#7F1D1D,#B45309)', color: '#FEF3C7' }}>
              <Typography variant="overline" sx={{ letterSpacing: 3 }}>{tx('You are invited')}</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: '#fff' }}>{card.functionName}</Typography>
              {card.funPersionNames && <Typography sx={{ mt: 1, fontSize: 18 }}>{card.funPersionNames}</Typography>}
              <Typography sx={{ mt: 2, fontWeight: 700 }}>{day(card.functionDate)}</Typography>
              {card.mahalName && <Typography>{card.mahalName}</Typography>}
              {card.funMessage && <Typography sx={{ mt: 2, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>{card.funMessage}</Typography>}
            </Box>
            <Box sx={{ p: { xs: 2.5, md: 4 } }}>
              <AnimatePresence mode="wait">
                {done ? (
                  <Box key="done" component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 56 }} />
                    <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>{tx(done)}</Typography>
                    <Button sx={{ mt: 2 }} onClick={() => setDone(null)}>{tx('Change my reply')}</Button>
                  </Box>
                ) : card.past ? (
                  <Alert severity="info">{tx('This function is over. Thank you!')}</Alert>
                ) : (
                  <Box key="form" component="form" onSubmit={submit} noValidate>
                    <Stack spacing={2}>
                      <ToggleButtonGroup exclusive fullWidth value={f.coming ? 'yes' : 'no'} onChange={(e, v) => v && setF((x) => ({ ...x, coming: v === 'yes' }))}>
                        <ToggleButton value="yes" color="success">{tx('Yes, coming')}</ToggleButton>
                        <ToggleButton value="no">{tx('Sorry, cannot come')}</ToggleButton>
                      </ToggleButtonGroup>
                      <TextField label={tx('Your name')} value={f.name} onChange={set('name')} required autoComplete="name" />
                      <TextField label={tx('Mobile')} type="tel" value={f.phone} onChange={set('phone')} required autoComplete="tel" />
                      <TextField label={tx('Your village or place')} value={f.place} onChange={set('place')} />
                      {f.coming && (
                        <TextField label={tx('How many people are coming?')} value={f.guests} onChange={(e) => setF((x) => ({ ...x, guests: e.target.value.replace(/\D/g, '').slice(0, 2) }))}
                          inputProps={{ inputMode: 'numeric' }} />
                      )}
                      <TextField label={tx('Message for the family (optional)')} value={f.note} onChange={set('note')} inputProps={{ maxLength: 300 }} />
                      <Box sx={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden>
                        <input tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} />
                      </Box>
                      {sendError && <Alert severity="error">{sendError}</Alert>}
                      <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? <CircularProgress size={22} color="inherit" /> : tx('Send reply')}</Button>
                    </Stack>
                  </Box>
                )}
              </AnimatePresence>
            </Box>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default InviteCard;
