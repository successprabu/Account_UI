import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, IconButton, Skeleton, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MicIcon from '@mui/icons-material/Mic';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SmsOutlinedIcon from '@mui/icons-material/SmsOutlined';
import CheckIcon from '@mui/icons-material/Check';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined';
import { EmptyState, notify } from '../ui';
import { aiStatus, draftFollowUp, listFollowUps, markFollowUp, parseBooking } from '../../api/mahalAi';
import { fmtRange, rupees } from './shared';

/** True once the server says AI is on. */
export const useAiEnabled = () => {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let live = true;
    aiStatus().then((v) => live && setOn(v));
    return () => {
      live = false;
    };
  }, []);
  return on;
};

const pad = (n) => String(n).padStart(2, '0');

/** An AI booking draft (dates YYYY-MM-DD + optional HH:mm) as the booking form's fields ("YYYY-MM-DDTHH:mm"). */
export const draftToForm = (d) => {
  const out = {};
  if (d.mahalId) out.mahalId = d.mahalId;
  if (d.customerName) out.customerName = d.customerName;
  if (d.phone) out.primary_phone = d.phone;
  if (d.eventType) out.eventType = d.eventType;
  if (d.guestCount) out.guestCount = String(d.guestCount);
  if (d.fromDate) {
    out.fromDate = `${d.fromDate}T${d.startTime || '06:00'}`;
    out.toDate = `${d.toDate || d.fromDate}T${d.endTime || '22:00'}`;
    if (out.toDate <= out.fromDate) {
      // e.g. an evening start on a one-day booking: end next morning
      const next = new Date(`${d.toDate || d.fromDate}T00:00`);
      next.setDate(next.getDate() + 1);
      out.toDate = `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}T${d.endTime || '06:00'}`;
    }
  }
  if (d.totalAmount != null) out.totalAmount = String(d.totalAmount);
  if (d.discount != null) out.discount = String(d.discount);
  if (d.advance != null) out.advance = String(d.advance);
  if (d.payMethod) out.payMethod = d.payMethod;
  if (d.remarks) out.remarks = d.remarks;
  return out;
};

const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined;

/**
 * "Type or speak a booking": the owner writes (or says) it in their own words; the AI fills the booking form, which
 * opens for checking. Nothing is saved until the owner presses Save.
 */
export const AiQuickBooking = ({ mahalId, onDraft }) => {
  const theme = useTheme();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en-IN');
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  useEffect(() => () => recRef.current?.abort?.(), []);

  const listen = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    const before = text ? `${text} ` : '';
    rec.onresult = (e) => setText(before + Array.from(e.results).map((r) => r[0].transcript).join(' '));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  const fill = async () => {
    if (text.trim().length < 5) {
      setError('Type or speak the booking first, e.g. the customer name, phone and date.');
      return;
    }
    setError('');
    setBusy(true);
    const res = await parseBooking(text.trim(), mahalId);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    onDraft(res.data);
    setText('');
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ mb: 2.5, p: 2, border: 1, borderColor: alpha(theme.palette.primary.main, 0.25), background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.07)}, ${alpha(theme.palette.secondary.main, 0.05)})` }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
        <Box component={motion.span} animate={{ rotate: [0, 15, -10, 0] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 3 }} sx={{ display: 'flex', color: 'primary.main' }}>
          <AutoAwesomeIcon />
        </Box>
        <Typography fontWeight={800}>Type or speak a booking</Typography>
        <Chip label="AI" size="small" color="primary" sx={{ height: 20, fontWeight: 800 }} />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ sm: 'flex-start' }}>
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) fill();
          }}
          placeholder="e.g. Ravi 98765 43210, marriage on 12 Dec, 500 guests, rent 75000, advance 20k by UPI"
          inputProps={{ 'aria-label': 'Booking in your words' }}
          InputProps={{
            endAdornment: SpeechRecognition ? (
              <Tooltip title={listening ? 'Stop' : `Speak (${lang === 'ta-IN' ? 'தமிழ்' : 'English'})`}>
                <IconButton onClick={listen} color={listening ? 'error' : 'primary'} aria-label={listening ? 'Stop listening' : 'Speak the booking'} size="small">
                  {listening ? (
                    <Box component={motion.span} animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }} sx={{ display: 'flex' }}><StopCircleOutlinedIcon /></Box>
                  ) : <MicIcon />}
                </IconButton>
              </Tooltip>
            ) : null,
          }}
          sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
        />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          {SpeechRecognition && (
            <ToggleButtonGroup size="small" exclusive value={lang} onChange={(_, v) => v && setLang(v)} aria-label="Voice language">
              <ToggleButton value="en-IN" sx={{ px: 1.25 }}>EN</ToggleButton>
              <ToggleButton value="ta-IN" sx={{ px: 1.25 }}>தமிழ்</ToggleButton>
            </ToggleButtonGroup>
          )}
          <Button variant="contained" onClick={fill} disabled={busy} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />} sx={{ whiteSpace: 'nowrap' }}>
            {busy ? 'Reading…' : 'Fill with AI'}
          </Button>
        </Stack>
      </Stack>
      {error && <Alert severity="warning" sx={{ mt: 1.25 }}>{error}</Alert>}
    </Card>
  );
};

const KIND = {
  balance: { label: 'Balance due', icon: <PaymentsOutlinedIcon />, color: 'warning' },
  reminder: { label: 'Event soon', icon: <EventOutlinedIcon />, color: 'info' },
  pending: { label: 'Waiting request', icon: <HourglassTopOutlinedIcon />, color: 'secondary' },
  thanks: { label: 'Say thank you', icon: <CelebrationOutlinedIcon />, color: 'success' },
};
const waDigits = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};

const FollowUpCard = ({ item, index, aiEnabled, onChanged }) => {
  const theme = useTheme();
  const meta = KIND[item.kind] || KIND.reminder;
  const [lang, setLang] = useState(item.lang || 'en');
  const [message, setMessage] = useState(item.message || '');
  const [busy, setBusy] = useState('');
  const done = item.status !== 'Open';

  const write = async (l = lang) => {
    setBusy('draft');
    const res = await draftFollowUp(item.id, l);
    setBusy('');
    if (res.ok) setMessage(res.data.message);
    else notify.error(res.message);
  };
  const mark = async (status) => {
    setBusy(status);
    const res = await markFollowUp(item.id, status, status === 'Sent' ? message : undefined);
    setBusy('');
    if (res.ok) onChanged();
    else notify.error(res.message);
  };
  const sendVia = (how) => {
    const text = encodeURIComponent(message);
    window.open(how === 'wa' ? `https://wa.me/${waDigits(item.phone)}?text=${text}` : `sms:${item.phone}?body=${text}`, '_blank', 'noopener');
    mark('Sent');
  };

  return (
    <Card
      component={motion.div}
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: done ? 0.6 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: Math.min(index, 8) * 0.05 }}
      sx={{ p: 2, borderLeft: 4, borderColor: `${meta.color}.main` }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', flexShrink: 0, color: `${meta.color}.main`, bgcolor: alpha(theme.palette[meta.color].main, 0.12) }}>
          {meta.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography fontWeight={800}>{item.customerName}</Typography>
            <Chip size="small" label={meta.label} color={meta.color} variant="outlined" />
            {done && <Chip size="small" icon={<CheckIcon />} label={item.status} />}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {item.mahalName} · {item.eventType || 'Event'} · {fmtRange(item.fromDate, item.toDate)}
            {item.kind === 'balance' && <> · Balance <b>{rupees(item.balance)}</b></>}
          </Typography>

          {!done && (
            <Box sx={{ mt: 1.25 }}>
              {message ? (
                <TextField fullWidth multiline minRows={2} size="small" value={message} onChange={(e) => setMessage(e.target.value)} inputProps={{ 'aria-label': `Message to ${item.customerName}` }} />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {aiEnabled ? 'Let AI write the message, then send it from WhatsApp or SMS.' : 'Write your message and send it from WhatsApp or SMS.'}
                </Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1.25 }} flexWrap="wrap" useFlexGap alignItems="center">
                {aiEnabled && (
                  <>
                    <ToggleButtonGroup size="small" exclusive value={lang} onChange={(_, v) => { if (v) { setLang(v); if (message) write(v); } }} aria-label="Message language">
                      <ToggleButton value="en">EN</ToggleButton>
                      <ToggleButton value="ta">தமிழ்</ToggleButton>
                    </ToggleButtonGroup>
                    <Button size="small" variant={message ? 'text' : 'contained'} onClick={() => write()} disabled={!!busy} startIcon={busy === 'draft' ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeIcon />}>
                      {message ? 'Rewrite' : 'Write with AI'}
                    </Button>
                  </>
                )}
                {!aiEnabled && !message && <Button size="small" onClick={() => setMessage(' ')}>Write message</Button>}
                <Box sx={{ flex: 1 }} />
                <Button size="small" variant="contained" color="success" startIcon={<WhatsAppIcon />} disabled={!message.trim() || !!busy} onClick={() => sendVia('wa')}>WhatsApp</Button>
                <Button size="small" variant="outlined" startIcon={<SmsOutlinedIcon />} disabled={!message.trim() || !!busy} onClick={() => sendVia('sms')}>SMS</Button>
                <Tooltip title="Not needed"><span><IconButton size="small" onClick={() => mark('Skipped')} disabled={!!busy} aria-label="Skip"><SkipNextOutlinedIcon /></IconButton></span></Tooltip>
              </Stack>
            </Box>
          )}
          {done && (
            <Button size="small" startIcon={<UndoIcon />} onClick={() => mark('Open')} disabled={!!busy} sx={{ mt: 0.5 }}>Undo</Button>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

/**
 * Who to message today: balance due before an event, events in the next two days, thank-yous after an event, and
 * requests that have been waiting. The AI writes the text; the owner sends it from their own WhatsApp or SMS.
 */
export const FollowUpsPanel = ({ onCount }) => {
  const [state, setState] = useState({ loading: true, items: [], aiEnabled: false, error: '' });

  const load = useCallback(async () => {
    const res = await listFollowUps();
    if (res.ok) {
      setState({ loading: false, items: res.data.items || [], aiEnabled: !!res.data.aiEnabled, error: '' });
      onCount?.(res.data.open || 0);
    } else setState((s) => ({ ...s, loading: false, error: res.message }));
  }, [onCount]);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) return <Stack spacing={1.5}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={120} />)}</Stack>;
  if (state.error) return <Alert severity="error" action={<Button color="inherit" onClick={load}>Retry</Button>}>{state.error}</Alert>;
  if (!state.items.length) {
    return (
      <Card>
        <EmptyState icon={<MarkChatReadOutlinedIcon />} title="All caught up" description="No one to message today. Balance reminders, event reminders and thank-yous will show up here." />
      </Card>
    );
  }
  return (
    <Stack spacing={1.5}>
      <AnimatePresence>
        {state.items.map((item, i) => <FollowUpCard key={item.id} item={item} index={i} aiEnabled={state.aiEnabled} onChanged={load} />)}
      </AnimatePresence>
    </Stack>
  );
};
