import { useTx } from '../../language/site';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import { photoUrl } from '../../api/mahal';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import DiamondOutlinedIcon from '@mui/icons-material/DiamondOutlined';
import ChildCareOutlinedIcon from '@mui/icons-material/ChildCareOutlined';
import HomeWorkOutlinedIcon from '@mui/icons-material/HomeWorkOutlined';
import BusinessCenterOutlinedIcon from '@mui/icons-material/BusinessCenterOutlined';
import TempleHinduOutlinedIcon from '@mui/icons-material/TempleHinduOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { toDay } from '../../api/mahal';

/** Events a hall can host. `key` is what the API stores. */
export const EVENT_TYPES = [
  { key: 'Marriage', icon: <FavoriteBorderIcon />, color: '#e11d48' },
  { key: 'Reception', icon: <CelebrationOutlinedIcon />, color: '#7c3aed' },
  { key: 'Engagement', icon: <DiamondOutlinedIcon />, color: '#db2777' },
  { key: 'Birthday', icon: <CakeOutlinedIcon />, color: '#f59e0b' },
  { key: 'Baby shower', icon: <ChildCareOutlinedIcon />, color: '#10b981' },
  { key: 'Ear piercing', icon: <TempleHinduOutlinedIcon />, color: '#0ea5e9' },
  { key: 'House warming', icon: <HomeWorkOutlinedIcon />, color: '#f97316' },
  { key: 'Corporate', icon: <BusinessCenterOutlinedIcon />, color: '#475569' },
  { key: 'Other', icon: <EventOutlinedIcon />, color: '#6366f1' },
];
export const eventMeta = (key) => EVENT_TYPES.find((e) => e.key === key) || EVENT_TYPES[EVENT_TYPES.length - 1];

export const AMENITIES = [
  'Air conditioned',
  'Parking',
  'Generator backup',
  'Dining hall',
  'Kitchen',
  'Rooms for guests',
  'Bride & groom rooms',
  'Stage & decoration',
  'Sound system',
  'Lift',
  'Wheelchair access',
  'Catering available',
];

/** Booking status → tone for StatusChip, plus a friendly label. */
export const STATUS = {
  Pending: { tone: 'warning', label: 'Request' },
  Confirmed: { tone: 'success', label: 'Confirmed' },
  Completed: { tone: 'info', label: 'Completed' },
  Cancelled: { tone: 'neutral', label: 'Cancelled' },
  Rejected: { tone: 'error', label: 'Declined' },
};

/** Past confirmed events show as completed. */
export const effectiveStatus = (b) =>
  b?.status === 'Confirmed' && b?.toDate && new Date(b.toDate) <= new Date() ? 'Completed' : b?.status;

export const rupees = (v, opts = {}) =>
  v === null || v === undefined || v === ''
    ? '—'
    : `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0, ...opts })}`;

export const fmtDate = (v, withTime = false) => {
  if (!v) return '';
  const d = new Date(v);
  return d.toLocaleString('en-IN', withTime
    ? { day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }
    : { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
};

/** "12 Dec 2026" or "12 – 13 Dec 2026"; the API's toDate is exclusive for day bookings. */
export const fmtRange = (from, to) => {
  if (!from) return '';
  const a = new Date(from);
  let b = to ? new Date(to) : null;
  if (b && b.getHours() === 0 && b.getMinutes() === 0) b = new Date(b.getTime() - 60000);
  const dm = { day: 'numeric', month: 'short' };
  if (!b || toDay(a) === toDay(b)) return a.toLocaleDateString('en-IN', { ...dm, year: 'numeric' });
  if (a.getFullYear() !== b.getFullYear()) return `${a.toLocaleDateString('en-IN', { ...dm, year: 'numeric' })} – ${b.toLocaleDateString('en-IN', { ...dm, year: 'numeric' })}`;
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.toLocaleDateString('en-IN', { ...dm, year: 'numeric' })}`;
  return `${a.toLocaleDateString('en-IN', dm)} – ${b.toLocaleDateString('en-IN', { ...dm, year: 'numeric' })}`;
};

export const daysBetween = (from, to) => Math.round((new Date(`${toDay(to)}T00:00:00`) - new Date(`${toDay(from)}T00:00:00`)) / 86400000) + 1;

export const placeLine = (m) => [m?.landmark, m?.districtName, m?.stateName].filter(Boolean).join(', ');

/** Motion presets shared by mahal screens. Kept subtle; framer-motion honours reduced-motion via MotionConfig. */
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: Math.min(i, 8) * 0.05, ease: [0.22, 1, 0.36, 1] } }),
};

const GRADIENTS = [
  ['#7c3aed', '#db2777'],
  ['#0ea5e9', '#6366f1'],
  ['#f59e0b', '#e11d48'],
  ['#10b981', '#0ea5e9'],
  ['#8b5cf6', '#0ea5e9'],
  ['#f97316', '#db2777'],
];

/** Hall cover photo (the uploaded cover, or an older photo link), or a colourful placeholder with the hall's initials. */
export const MahalImage = ({ mahal, height = 180, radius = 0, children }) => {
  const [broken, setBroken] = useState(false);
  const [a, b] = GRADIENTS[(mahal?.id || 0) % GRADIENTS.length];
  const initials = (mahal?.mahalName || 'Mahal')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
  return (
    <Box sx={{ position: 'relative', height, borderRadius: radius, overflow: 'hidden', background: `linear-gradient(135deg, ${a}, ${b})` }}>
      {(mahal?.coverPhotoId || mahal?.imageUrl) && !broken ? (
        <Box
          component="img"
          src={mahal.coverPhotoId ? photoUrl(mahal.coverPhotoId, height <= 240) : mahal.imageUrl}
          alt={mahal.mahalName}
          loading="lazy"
          onError={() => setBroken(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s ease', '.mahal-card:hover &': { transform: 'scale(1.05)' } }}
        />
      ) : (
        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%', color: '#fff', position: 'relative' }}>
          <Box sx={{ position: 'absolute', inset: 0, opacity: 0.18, background: 'radial-gradient(circle at 20% 20%, #fff 0, transparent 40%), radial-gradient(circle at 80% 70%, #fff 0, transparent 35%)' }} />
          <ApartmentOutlinedIcon sx={{ fontSize: Math.min(56, height / 3), opacity: 0.9 }} />
          <Typography sx={{ fontWeight: 800, fontSize: Math.min(28, height / 6), letterSpacing: 2, mt: 0.5 }}>{initials}</Typography>
        </Stack>
      )}
      {mahal?.photos?.length > 1 && (
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ position: 'absolute', bottom: 10, left: 10, px: 1, py: 0.25, borderRadius: 99, bgcolor: 'rgba(15,23,42,.7)', color: '#fff' }}>
          <PhotoLibraryOutlinedIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption" fontWeight={700}>{mahal.photos.length}</Typography>
        </Stack>
      )}
      {children}
    </Box>
  );
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Month calendar showing booked / requested days and a selected range.
 * booked, requested: Set of "yyyy-MM-dd". value: { from: Date|null, to: Date|null }.
 * onSelect(day: Date) is called for a free day; days before minDate and booked days are disabled.
 * renderDay(dateKey) can add content (e.g. owner calendar shows booking names).
 */
export const AvailabilityCalendar = ({ booked = new Set(), requested = new Set(), value, onSelect, minDate, renderDay, initialMonth, compact = false }) => {
  const tx = useTx();
  const { i18n } = useTranslation();
  // Month names in the visitor's language (ta-IN, hi-IN …); English stays en-IN.
  const locale = `${(i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2)}-IN`;
  const theme = useTheme();
  const start = initialMonth || value?.from || new Date();
  const [month, setMonth] = useState(new Date(start.getFullYear(), start.getMonth(), 1));
  const [dir, setDir] = useState(0);
  const today = toDay(new Date());
  const min = minDate ? toDay(minDate) : null;
  const fromKey = value?.from ? toDay(value.from) : null;
  const toKey = value?.to ? toDay(value.to) : fromKey;

  const cells = useMemo(() => {
    const first = new Date(month);
    const lead = first.getDay();
    const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out = [];
    for (let i = 0; i < lead; i += 1) out.push(null);
    for (let d = 1; d <= daysIn; d += 1) out.push(new Date(month.getFullYear(), month.getMonth(), d));
    return out;
  }, [month]);

  const go = (n) => {
    setDir(n);
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  };

  const primary = theme.palette.primary.main;
  const label = month.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <IconButton size="small" onClick={() => go(-1)} aria-label="Previous month">
          <ChevronLeftIcon />
        </IconButton>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={label} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}>
            <Typography fontWeight={700} aria-live="polite">{label}</Typography>
          </motion.div>
        </AnimatePresence>
        <IconButton size="small" onClick={() => go(1)} aria-label="Next month">
          <ChevronRightIcon />
        </IconButton>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {WEEKDAYS.map((w) => (
          <Typography key={w} variant="caption" color="text.secondary" textAlign="center" fontWeight={600}>
            {compact ? tx(w)[0] : tx(w)}
          </Typography>
        ))}
      </Box>
      <Box sx={{ overflow: 'hidden' }}>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={label}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }} role="grid" aria-label={label}>
              {cells.map((d, i) => {
                if (!d) return <Box key={`x${i}`} />;
                const key = toDay(d);
                const isBooked = booked.has(key);
                const isReq = !isBooked && requested.has(key);
                const past = (min && key < min) || false;
                const inRange = fromKey && key >= fromKey && key <= toKey;
                const isEdge = key === fromKey || key === toKey;
                const disabled = !onSelect || past || isBooked;
                const status = tx(isBooked ? 'Booked' : isReq ? 'Requested by someone, may still be free' : past ? 'Not available' : 'Available');
                const bg = inRange
                  ? isEdge ? primary : alpha(primary, 0.16)
                  : isBooked
                    ? alpha(theme.palette.error.main, theme.palette.mode === 'dark' ? 0.3 : 0.12)
                    : isReq
                      ? alpha(theme.palette.warning.main, theme.palette.mode === 'dark' ? 0.3 : 0.16)
                      : 'transparent';
                return (
                  <Tooltip key={key} title={`${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${status}`} disableInteractive enterDelay={400}>
                    <Box
                      component={renderDay ? 'div' : motion.button}
                      type={renderDay ? undefined : 'button'}
                      role={renderDay ? 'gridcell' : undefined}
                      {...(renderDay ? {} : { whileTap: disabled ? undefined : { scale: 0.9 }, whileHover: disabled ? undefined : { y: -2 } })}
                      disabled={renderDay ? undefined : disabled}
                      onClick={() => !disabled && onSelect(d)}
                      aria-label={renderDay ? undefined : `${d.toDateString()}, ${status}`}
                      aria-pressed={inRange || undefined}
                      sx={{
                        all: 'unset',
                        boxSizing: 'border-box',
                        cursor: disabled ? 'default' : 'pointer',
                        minHeight: renderDay ? { xs: 54, md: 88 } : compact ? 34 : 42,
                        p: renderDay ? 0.5 : 0,
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: renderDay ? 'stretch' : 'center',
                        justifyContent: renderDay ? 'flex-start' : 'center',
                        position: 'relative',
                        fontSize: 14,
                        fontWeight: key === today || isEdge ? 700 : 500,
                        color: inRange && isEdge ? '#fff' : past ? 'text.disabled' : isBooked ? 'error.main' : 'text.primary',
                        textDecoration: isBooked && !renderDay ? 'line-through' : 'none',
                        bgcolor: bg,
                        border: '1px solid',
                        borderColor: key === today ? primary : renderDay ? 'divider' : 'transparent',
                        transition: 'background-color .15s',
                        '&:hover': disabled ? {} : { bgcolor: inRange ? undefined : alpha(primary, 0.1) },
                        '&:focus-visible': { outline: `2px solid ${primary}`, outlineOffset: 1 },
                      }}
                    >
                      <Box component="span" sx={{ textAlign: renderDay ? 'right' : 'center', pr: renderDay ? 0.5 : 0 }}>{d.getDate()}</Box>
                      {renderDay && renderDay(key)}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
      {!renderDay && (
        <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
          {[
            ['Available', 'transparent', theme.palette.divider],
            ['Requested', alpha(theme.palette.warning.main, 0.25), 'transparent'],
            ['Booked', alpha(theme.palette.error.main, 0.2), 'transparent'],
            ['Your dates', primary, 'transparent'],
          ].map(([t, bg, bc]) => (
            <Stack key={t} direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 14, height: 14, borderRadius: 0.75, bgcolor: bg, border: `1px solid ${bc}` }} />
              <Typography variant="caption" color="text.secondary">{tx(t)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Box>
  );
};
