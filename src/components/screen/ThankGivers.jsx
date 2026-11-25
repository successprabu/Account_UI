import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Button, Card, Chip, Container, IconButton, LinearProgress, Skeleton, Stack, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import UndoIcon from '@mui/icons-material/Undo';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import { listThanks, markThanked } from '../../api/family';
import { rupees } from '../moitech/shared';
import { EmptyState, notify } from '../ui';
import { useTx } from '../../language/site';

const SITE = 'https://mysuccess.azurewebsites.net';
const TEMPLATES = {
  ta: 'வணக்கம் {name}, {function} விழாவில் நீங்கள் வழங்கிய ₹{amount} மொய்க்கு மனமார்ந்த நன்றி. உங்கள் வருகையும் வாழ்த்தும் எங்களுக்கு பெரும் மகிழ்ச்சி.\n- {family}',
  en: 'Dear {name}, thank you for your moi of ₹{amount} at {function}. Your presence and blessings meant a lot to us.\n- {family}',
};
const FOOTER = `\n\nRecorded with Moitech: ${SITE}`;
const KEY = 'moitech.thanksTemplate';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    return {};
  }
};
const loadTemplates = () => {
  try {
    return { ...TEMPLATES, ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
  } catch (e) {
    return TEMPLATES;
  }
};
const waNumber = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  return d.length === 10 ? `91${d}` : d;
};

/** WhatsApp thank-you to every giver with a mobile number, one tap each, or "Send next" down the list. */
const ThankGivers = () => {
  const tx = useTx();
  const user = readUser();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('todo');
  const [lang, setLang] = useState(() => (localStorage.getItem('i18nextLng') || 'ta').startsWith('en') ? 'en' : 'ta');
  const [templates, setTemplates] = useState(loadTemplates);

  const load = useCallback(async () => {
    if (!user.functionId) {
      setError(tx('Choose one of your functions first.'));
      setData({ items: [], total: 0, withPhone: 0, thanked: 0 });
      return;
    }
    const r = await listThanks(user.functionId);
    if (r.ok) setData(r.data);
    else {
      setError(tx(r.message));
      setData({ items: [], total: 0, withPhone: 0, thanked: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.functionId]);

  useEffect(() => {
    load();
  }, [load]);

  const setTemplate = (v) => {
    const next = { ...templates, [lang]: v };
    setTemplates(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch (e) { /* private mode */ }
  };

  const message = (e) => {
    const fn = data?.function || {};
    return templates[lang]
      .replaceAll('{name}', [e.initial, e.name].filter(Boolean).join('. '))
      .replaceAll('{amount}', Number(e.amount || 0).toLocaleString('en-IN'))
      .replaceAll('{function}', fn.functionName || '')
      .replaceAll('{family}', fn.funPersionNames || user.name || '') + FOOTER;
  };

  const mark = async (e, undo = false) => {
    const r = await markThanked(e.id, undo);
    if (!r.ok) {
      notify.error(tx(r.message));
      return;
    }
    setData((d) => ({
      ...d,
      thanked: d.thanked + (undo ? -1 : e.thankedDt ? 0 : 1),
      items: d.items.map((x) => (x.id === e.id ? { ...x, thankedDt: r.data.thankedDt } : x)),
    }));
  };

  const send = (e) => {
    window.open(`https://wa.me/${waNumber(e.phoneNo)}?text=${encodeURIComponent(message(e))}`, '_blank', 'noopener');
    mark(e);
  };

  const todo = useMemo(() => (data?.items || []).filter((e) => !e.thankedDt), [data]);
  const shown = tab === 'todo' ? todo : (data?.items || []).filter((e) => e.thankedDt);
  const pct = data?.withPhone ? Math.round((data.thanked / data.withPhone) * 100) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>{tx('Thank your givers')}</Typography>
          <Typography color="text.secondary">{tx('Send each giver a WhatsApp thank-you with their moi amount. Tap Send next to go down the list.')}</Typography>
        </Box>
        <Button variant="contained" color="success" size="large" startIcon={<SkipNextIcon />} disabled={!todo.length} onClick={() => send(todo[0])} sx={{ flexShrink: 0 }}>
          {tx('Send next')}{todo.length ? ` (${todo.length})` : ''}
        </Button>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography fontWeight={700}>{tx('Message')}</Typography>
              <ToggleButtonGroup size="small" exclusive value={lang} onChange={(e, v) => v && setLang(v)}>
                <ToggleButton value="ta">தமிழ்</ToggleButton>
                <ToggleButton value="en">English</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
            <TextField multiline minRows={3} fullWidth value={templates[lang]} onChange={(e) => setTemplate(e.target.value)}
              helperText={tx('{name}, {amount}, {function} and {family} are filled in for each giver.')} />
            <Button size="small" sx={{ mt: 0.5 }} onClick={() => setTemplate(TEMPLATES[lang])}>{tx('Reset message')}</Button>
          </Box>
          <Box sx={{ width: { md: 280 } }}>
            <Typography fontWeight={700} sx={{ mb: 1 }}>{tx('Progress')}</Typography>
            {data ? (
              <>
                <Typography variant="h4" fontWeight={800}>{data.thanked} / {data.withPhone}</Typography>
                <LinearProgress variant="determinate" value={pct} color="success" sx={{ height: 8, borderRadius: 4, my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  {tx('{{n}} receipts have no mobile number.', { n: Math.max(0, data.total - data.withPhone) })}
                </Typography>
              </>
            ) : <Skeleton height={80} />}
          </Box>
        </Stack>
      </Card>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="todo" label={`${tx('Not yet thanked')} (${todo.length})`} />
        <Tab value="done" label={`${tx('Thanked')} (${data?.thanked || 0})`} />
      </Tabs>

      {!data ? (
        <Stack spacing={1}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={64} />)}</Stack>
      ) : shown.length === 0 ? (
        <Card>
          <EmptyState icon={tab === 'todo' && data.withPhone ? <CheckCircleIcon /> : <VolunteerActivismOutlinedIcon />}
            title={tx(tab === 'todo' && data.withPhone ? 'Everyone is thanked' : 'Nothing here yet')}
            description={tx('Givers appear here when their receipt has a mobile number.')} />
        </Card>
      ) : (
        <Card>
          {shown.map((e, i) => (
            <Stack key={e.id} direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, py: 1.25, borderBottom: i < shown.length - 1 ? 1 : 0, borderColor: 'divider' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>{[e.initial, e.name].filter(Boolean).join('. ')}</Typography>
                <Typography variant="body2" color="text.secondary" noWrap>{e.villageName} · {e.phoneNo}</Typography>
              </Box>
              {e.payMode === 'Online' && <Chip size="small" variant="outlined" color="success" label={tx('Online')} />}
              <Typography fontWeight={800} sx={{ minWidth: 80, textAlign: 'right' }}>{rupees(e.amount)}</Typography>
              {e.thankedDt ? (
                <>
                  <Tooltip title={tx('Send again')}><IconButton color="success" onClick={() => send(e)}><WhatsAppIcon /></IconButton></Tooltip>
                  <Tooltip title={tx('Mark as not thanked')}><IconButton onClick={() => mark(e, true)}><UndoIcon /></IconButton></Tooltip>
                </>
              ) : (
                <Button variant="outlined" color="success" startIcon={<WhatsAppIcon />} onClick={() => send(e)}>{tx('Send')}</Button>
              )}
            </Stack>
          ))}
        </Card>
      )}
    </Container>
  );
};

export default ThankGivers;
