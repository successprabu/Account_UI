import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, Box, Button, Card, Chip, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import { listReminders, markReminder } from '../../api/mahalOps';
import { useTx } from '../../language/site';
import { fmtRange, rupees } from './shared';
import { hallMessage, waLink } from './hallMessages';

const KIND = {
  tomorrow: { label: 'Event tomorrow', icon: <EventOutlinedIcon />, color: '#0ea5e9' },
  balance: { label: 'Balance due', icon: <CurrencyRupeeIcon />, color: '#f59e0b' },
  thanks: { label: 'Say thank you', icon: <FavoriteBorderIcon />, color: '#e11d48' },
  moitech: { label: 'Offer Moitech free', icon: <VolunteerActivismOutlinedIcon />, color: '#6366f1' },
};

/**
 * "Send today" on the mahal dashboard: WhatsApp reminders (event tomorrow, balance due, thank-you) and a free Moitech
 * offer for families with an upcoming booking. One tap opens WhatsApp with the message ready, and marks it sent.
 */
const RemindersCard = () => {
  const tx = useTx();
  const { i18n } = useTranslation();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [lang, setLang] = useState(() => ((i18n.resolvedLanguage || i18n.language || 'en').startsWith('ta') ? 'ta' : 'en'));

  const load = useCallback(async () => {
    const res = await listReminders();
    if (res.ok) {
      setItems(res.data || []);
      setError('');
    } else {
      setItems([]);
      setError(res.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const send = (r) => {
    window.open(waLink(r.phone, hallMessage(r.kind, r, lang)), '_blank', 'noopener,noreferrer');
    setItems((list) => list.filter((x) => !(x.bookingId === r.bookingId && x.kind === r.kind)));
    markReminder(r.bookingId, r.kind);
  };

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <NotificationsActiveOutlinedIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>{tx('Send today')}</Typography>
          {items?.length > 0 && <Chip size="small" color="primary" label={items.length} />}
        </Stack>
        <ToggleButtonGroup size="small" exclusive value={lang} onChange={(e, v) => v && setLang(v)} aria-label={tx('Message language')}>
          <ToggleButton value="en">EN</ToggleButton>
          <ToggleButton value="ta">தமிழ்</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {items === null ? (
        <Stack spacing={1}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={56} />)}</Stack>
      ) : error ? (
        <Typography variant="body2" color="text.secondary">{tx(error)}</Typography>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">{tx('All caught up. Reminders for upcoming events appear here.')}</Typography>
      ) : (
        <Stack spacing={1}>
          <AnimatePresence initial={false}>
            {items.slice(0, 12).map((r) => {
              const k = KIND[r.kind] || KIND.tomorrow;
              return (
                <Box key={`${r.kind}-${r.bookingId}`} component={motion.div} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.25, borderRadius: 2, bgcolor: alpha(k.color, 0.06) }}>
                  <Avatar sx={{ bgcolor: alpha(k.color, 0.15), color: k.color, width: 36, height: 36 }}>{k.icon}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>{tx(k.label)} · {r.customerName}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap component="div">
                      {fmtRange(r.fromDate, r.toDate)} · {r.mahalName}{r.kind === 'balance' ? ` · ${rupees(r.balance)}` : ''}
                    </Typography>
                  </Box>
                  <Button size="small" color="success" variant="contained" startIcon={<WhatsAppIcon />} onClick={() => send(r)} sx={{ flexShrink: 0 }}>
                    {tx('Send')}
                  </Button>
                </Box>
              );
            })}
          </AnimatePresence>
        </Stack>
      )}
    </Card>
  );
};

export default RemindersCard;
