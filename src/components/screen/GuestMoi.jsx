import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  Alert, Box, Button, Card, CircularProgress, Container, InputAdornment, MenuItem, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AppHeader from '../common/AppHeader';
import { getGuestPage, sendGuestEntry } from '../../api/guestEntry';
import { upiLink } from '../moitech/PayModeToggle';
import { EntryField, useSuggestions, useVoice } from '../moitech/shared';
import { useTx } from '../../language/site';

const empty = { villageName: '', initial: '', name: '', phoneNo: '', amount: '', payMode: 'Cash', note: '', upiRef: '', website: '' };
const LANGS = [['ta', 'தமிழ்'], ['en', 'English'], ['hi', 'हिन्दी'], ['te', 'తెలుగు'], ['kn', 'ಕನ್ನಡ'], ['ml', 'മലയാളം']];

/** Public: the page a guest opens by scanning the moi-counter QR. They type their own moi; a helper accepts it. */
const GuestMoi = () => {
  const tx = useTx();
  const { token } = useParams();
  const [fn, setFn] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [done, setDone] = useState(null);

  useEffect(() => {
    document.title = 'Moi';
    getGuestPage(token).then((r) => (r.ok ? setFn(r.data) : setError(tx(r.message))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  // Names in the guest's own script: type in English letters and pick the word, or speak it.
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('moitech.guestLang') || 'ta';
    } catch (e) {
      return 'ta';
    }
  });
  const pickLang = (v) => {
    setLang(v);
    try {
      localStorage.setItem('moitech.guestLang', v);
    } catch (e) { /* private mode */ }
  };
  const setField = useCallback((k, v) => setForm((f) => ({ ...f, [k]: v })), []);
  const suggest = useSuggestions(lang !== 'en', lang, setField);
  const voice = useVoice(lang);
  const textProps = (k, label, extra = {}) => ({
    label,
    value: form[k],
    onChange: (e) => {
      setField(k, e.target.value);
      const word = e.target.value.split(' ').pop();
      if (/^[a-zA-Z]+$/.test(word)) suggest.lookup(k, e.target.value);
      else suggest.clear();
    },
    onKeyDown: (e) => suggest.handleKey(e),
    onBlur: () => setTimeout(suggest.clear, 150),
    recording: voice.field === k,
    onMic: () => voice.toggle(k, (said) => setField(k, said)),
    ...suggest.propsFor(k),
    ...extra,
  });
  const amount = Number(form.amount) || 0;

  const submit = async (e) => {
    e.preventDefault();
    setSendError('');
    if (form.villageName.trim().length < 2) return setSendError(tx('Please enter your village or place.'));
    if (form.name.trim().length < 2) return setSendError(tx('Please enter your name.'));
    if (!(amount > 0)) return setSendError(tx('Please enter the moi amount.'));
    setSending(true);
    const r = await sendGuestEntry({ ...form, token, amount });
    setSending(false);
    if (r.ok) setDone({ message: r.message, amount, payMode: form.payMode, name: form.name });
    else setSendError(tx(r.message));
    return undefined;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppHeader />
      <Container maxWidth="sm" sx={{ py: { xs: 3, md: 6 } }}>
        {error ? <Alert severity="warning">{error}</Alert> : !fn ? <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box> : (
          <Card sx={{ p: { xs: 2.5, md: 4 } }}>
            <Typography variant="overline" color="primary" fontWeight={800}>{tx('Write your moi')}</Typography>
            <Typography variant="h5" fontWeight={800}>{fn.functionName}</Typography>
            {fn.funPersionNames && <Typography color="text.secondary">{fn.funPersionNames}</Typography>}
            <AnimatePresence mode="wait">
              {done ? (
                <Box key="done" component={motion.div} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} sx={{ textAlign: 'center', py: 3 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 64 }} />
                  <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>₹{done.amount.toLocaleString('en-IN')} · {done.name}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>{tx(done.message)}</Typography>
                  <Button sx={{ mt: 3 }} onClick={() => { setDone(null); setForm(empty); }}>{tx('Write another moi')}</Button>
                </Box>
              ) : (
                <Box key="form" component="form" onSubmit={submit} noValidate sx={{ mt: 2.5 }}>
                  <Stack spacing={2}>
                    <TextField select size="small" label={tx('Language for names')} value={lang} onChange={(e) => pickLang(e.target.value)}
                      helperText={lang === 'en' ? '' : tx('Type in English letters and pick the word, or tap the mic and speak.')}>
                      {LANGS.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                    </TextField>
                    <EntryField {...textProps('villageName', tx('Your village or place'), { required: true })} />
                    <Stack direction="row" spacing={1.5}>
                      <EntryField {...textProps('initial', tx('Initial'))} sx={{ width: 130, flexShrink: 0 }} />
                      <EntryField {...textProps('name', tx('Your name'), { required: true })} sx={{ flex: 1 }} />
                    </Stack>
                    <TextField label={tx('Moi amount')} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value.replace(/[^\d]/g, '').slice(0, 7) }))} required
                      InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} inputProps={{ inputMode: 'numeric' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>{tx('How are you giving it?')}</Typography>
                      <ToggleButtonGroup exclusive fullWidth value={form.payMode} onChange={(e, v) => v && setForm((f) => ({ ...f, payMode: v }))}>
                        <ToggleButton value="Cash"><PaymentsOutlinedIcon fontSize="small" sx={{ mr: 0.75 }} />{tx('Cash at the counter')}</ToggleButton>
                        <ToggleButton value="Online" disabled={!fn.upiId}><PhoneAndroidIcon fontSize="small" sx={{ mr: 0.75 }} />{tx('UPI')}</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    {form.payMode === 'Online' && fn.upiId && (
                      <Alert severity="info" icon={false}>
                        <Typography variant="body2" sx={{ mb: 1 }}>{tx('Scan this QR with any UPI app (GPay, PhonePe, Paytm) and pay the family, then send this form. The helper adds your moi once the payment is received.')}</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2 }}><QRCodeSVG value={`${upiLink(fn.upiId, fn.upiName || fn.funPersionNames, fn.functionName)}${amount ? `&am=${amount}` : ''}`} size={130} /></Box>
                          <Box>
                            <Typography fontWeight={700}>{fn.upiName || fn.funPersionNames}</Typography>
                            <Typography variant="body2">{fn.upiId}</Typography>
                            <Button size="small" variant="contained" sx={{ mt: 1 }} href={`${upiLink(fn.upiId, fn.upiName || fn.funPersionNames, fn.functionName)}${amount ? `&am=${amount}` : ''}`}>{tx('Open UPI app')}</Button>
                          </Box>
                        </Stack>
                      </Alert>
                    )}
                    {form.payMode === 'Online' && fn.upiId && (
                      <TextField label={tx('UPI transaction ID (optional)')} value={form.upiRef} onChange={(e) => setForm((f) => ({ ...f, upiRef: e.target.value.slice(0, 40) }))}
                        helperText={tx('After paying, type the UPI reference or its last 6 digits, so the helper can match your payment.')} />
                    )}
                    <TextField label={tx('Phone (optional)')} type="tel" value={form.phoneNo} onChange={set('phoneNo')} autoComplete="tel" helperText={tx('So the family can thank you on WhatsApp.')} />
                    <TextField label={tx('Message for the family (optional)')} value={form.note} onChange={set('note')} inputProps={{ maxLength: 300 }} />
                    <Box sx={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }} aria-hidden>
                      <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                    </Box>
                    {sendError && <Alert severity="error">{sendError}</Alert>}
                    <Button type="submit" variant="contained" size="large" disabled={sending}>{sending ? <CircularProgress size={22} color="inherit" /> : tx('Send my moi')}</Button>
                    <Typography variant="caption" color="text.secondary" textAlign="center">{tx('A helper at the counter checks and adds it. Only the family sees your entry.')}</Typography>
                  </Stack>
                </Box>
              )}
            </AnimatePresence>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default GuestMoi;
