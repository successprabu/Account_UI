import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Box, Chip, Stack, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import './regShowcase.css';

/**
 * Registration pages (Moitech and Mahal Management): an animated, festive side panel next to the sign-up form.
 * Everything is inline SVG + framer-motion (no GIF files), so it loads instantly and stays sharp on any screen.
 * Animations respect the visitor's "reduce motion" setting.
 */

const THEMES = {
  moitech: {
    bg: 'linear-gradient(160deg, #FFF7E6 0%, #FDE7C2 45%, #FBCFE8 100%)',
    ink: '#7C2D12',
    accent: '#DC2626',
    chip: '#F59E0B',
    tamil: 'மொய் கணக்கு — இனி கைபேசியில் எளிது',
    title: 'Every moi, counted right.',
    sub: 'Replace the notebook and calculator at your function. Helpers record from their own phones, totals add up live.',
    words: ['Weddings', 'Moi Virunthu', 'Ear-piercing', 'House-warming', 'Puberty functions'],
    ticks: ['Voice entry & Tamil spelling help', 'Read a written moi list from a photo', 'Hand-over per helper, no shortfall', 'Tamil PDF & Excel reports'],
    badge: '7 days free · plans from ₹99/month',
  },
  mahal: {
    bg: 'linear-gradient(160deg, #3B0A0A 0%, #7F1D1D 55%, #B45309 100%)',
    ink: '#FFF7E6',
    accent: '#FACC15',
    chip: '#D4A017',
    tamil: 'மண்டப முன்பதிவு — ஒரே இடத்தில்',
    title: 'Fill every date. Never double-book.',
    sub: 'Bookings, advance, balance and payments for your marriage hall — plus your own online booking page.',
    words: ['Weddings', 'Receptions', 'Engagements', 'Birthday parties', 'Seemantham'],
    ticks: ['Calendar with double-booking warning', 'Advance & balance worked out for you', 'WhatsApp customers in one tap', 'Customers book online 24×7'],
    badge: '1 month free · then ₹4,999/month',
  },
};

/** Cycles through words (occasions) with a soft slide. */
const WordTicker = ({ words, color }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => clearInterval(id);
  }, [words.length]);
  return (
    <Box component="span" sx={{ display: 'inline-grid', verticalAlign: 'bottom', overflow: 'hidden' }}>
      <AnimatePresence mode="wait" initial={false}>
        <Box
          key={words[i]}
          component={motion.span}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.35 }}
          sx={{ color, fontWeight: 800, gridArea: '1 / 1' }}
        >
          {words[i]}
        </Box>
      </AnimatePresence>
    </Box>
  );
};

/* ------------------------------------------------------------------ Moitech scene */

const ENTRIES = [
  ['Murugan · Karaikudi', 1001],
  ['Lakshmi · Devakottai', 501],
  ['Selvam · Madurai', 2001],
  ['Kavitha · Pudukkottai', 1116],
  ['Ravi · Sivagangai', 751],
];

const Marigold = ({ x, y, r = 7, c = '#F59E0B' }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={c} />
    <circle cx={x} cy={y} r={r * 0.6} fill="#FBBF24" />
    <circle cx={x} cy={y} r={r * 0.25} fill="#B45309" />
  </g>
);

const MoitechScene = () => {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setShown((n) => (n >= ENTRIES.length ? 1 : n + 1)), 1300);
    return () => clearInterval(id);
  }, []);
  const total = ENTRIES.slice(0, shown).reduce((s, e) => s + e[1], 0);

  return (
    <svg viewBox="0 0 360 270" className="reg-scene" role="img" aria-label="Moi entries adding up on a phone at a function">
      {/* toran: mango leaves + marigolds swaying */}
      <motion.g style={{ originX: '180px', originY: '0px' }} animate={{ rotate: [-1.2, 1.2, -1.2] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <path d="M0 8 Q180 46 360 8" stroke="#92400E" strokeWidth="2" fill="none" />
        {Array.from({ length: 13 }, (_, k) => {
          const x = 14 + k * 27;
          const y = 8 + 38 * (1 - ((x - 180) / 180) ** 2) * 0.95;
          return k % 2 ? (
            <motion.ellipse key={k} cx={x} cy={y + 11} rx="5" ry="12" fill="#15803D" style={{ originX: `${x}px`, originY: `${y}px` }} animate={{ rotate: [-6, 6, -6] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.1 }} />
          ) : (
            <Marigold key={k} x={x} y={y + 4} c={k % 4 ? '#F59E0B' : '#EA580C'} />
          );
        })}
      </motion.g>

      {/* kolam, slowly turning */}
      <motion.g style={{ originX: '58px', originY: '210px' }} animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}>
        <circle cx="58" cy="210" r="40" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="2 5" />
        {Array.from({ length: 8 }, (_, k) => (
          <ellipse key={k} cx="58" cy="186" rx="7" ry="16" fill="none" stroke="#B45309" strokeWidth="1.4" transform={`rotate(${k * 45} 58 210)`} />
        ))}
        <circle cx="58" cy="210" r="5" fill="#DC2626" />
      </motion.g>

      {/* diyas with flickering flames */}
      {[300, 330].map((x, k) => (
        <g key={x}>
          <path d={`M${x - 14} 244 Q${x} 262 ${x + 14} 244 Z`} fill="#B45309" />
          <motion.path d={`M${x} 228 Q${x + 6} 238 ${x} 244 Q${x - 6} 238 ${x} 228 Z`} fill="#F59E0B" style={{ originX: `${x}px`, originY: '244px' }} animate={{ scaleY: [1, 1.25, 0.9, 1.15, 1], opacity: [0.9, 1, 0.85, 1, 0.9] }} transition={{ duration: 1.1, repeat: Infinity, delay: k * 0.3 }} />
        </g>
      ))}

      {/* ₹ coins rising */}
      {[110, 250, 285, 140].map((x, k) => (
        <motion.g key={k} initial={{ y: 0, opacity: 0 }} animate={{ y: [-0, -150], opacity: [0, 1, 0] }} transition={{ duration: 3.6, repeat: Infinity, delay: k * 0.9, ease: 'easeOut' }}>
          <circle cx={x} cy="250" r="9" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
          <text x={x} y="254" textAnchor="middle" fontSize="11" fontWeight="800" fill="#92400E">₹</text>
        </motion.g>
      ))}

      {/* phone with moi entries */}
      <motion.g initial={{ y: 20, opacity: 0 }} animate={{ y: [0, -5, 0], opacity: 1 }} transition={{ y: { duration: 4, repeat: Infinity, ease: 'easeInOut' }, opacity: { duration: 0.6 } }}>
        <rect x="118" y="58" width="132" height="200" rx="18" fill="#0F172A" />
        <rect x="124" y="66" width="120" height="184" rx="13" fill="#fff" />
        <rect x="124" y="66" width="120" height="30" rx="13" fill="#6366F1" />
        <rect x="124" y="83" width="120" height="13" fill="#6366F1" />
        <text x="134" y="86" fontSize="10.5" fontWeight="800" fill="#fff">Moitech · மொய் புத்தகம்</text>
        {ENTRIES.slice(0, shown).map(([n, amt], k) => (
          <motion.g key={n} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
            <rect x="130" y={102 + k * 23} width="108" height="19" rx="5" fill={k === shown - 1 ? '#FEF3C7' : '#F8FAFC'} />
            <text x="135" y={115 + k * 23} fontSize="7.6" fill="#334155">{n}</text>
            <text x="233" y={115 + k * 23} fontSize="8" fontWeight="800" fill="#15803D" textAnchor="end">₹{amt}</text>
          </motion.g>
        ))}
        <rect x="130" y="222" width="108" height="22" rx="7" fill="#10B981" />
        <text x="136" y="236" fontSize="8.5" fill="#fff" fontWeight="700">Total</text>
        <text x="232" y="237" fontSize="11" fill="#fff" fontWeight="900" textAnchor="end">₹{total.toLocaleString('en-IN')}</text>
      </motion.g>

      {/* voice bubble */}
      <motion.g animate={{ scale: [0.9, 1, 0.9] }} style={{ originX: '300px', originY: '110px' }} transition={{ duration: 1.8, repeat: Infinity }}>
        <rect x="262" y="94" width="84" height="30" rx="15" fill="#fff" stroke="#F59E0B" strokeWidth="1.5" />
        <circle cx="279" cy="109" r="8" fill="#DC2626" />
        <rect x="276.5" y="103" width="5" height="9" rx="2.5" fill="#fff" />
        {[0, 1, 2, 3].map((k) => (
          <motion.rect key={k} x={293 + k * 9} y="101" width="4" height="16" rx="2" fill="#F59E0B" style={{ originY: '109px' }} animate={{ scaleY: [0.3, 1, 0.4] }} transition={{ duration: 0.7, repeat: Infinity, delay: k * 0.12 }} />
        ))}
      </motion.g>
    </svg>
  );
};

/* ------------------------------------------------------------------ Mahal scene */

const BOOKED_ORDER = [3, 9, 14, 6, 17, 1, 12, 19];

const MahalScene = () => {
  const [booked, setBooked] = useState(2);
  useEffect(() => {
    const id = setInterval(() => setBooked((n) => (n >= BOOKED_ORDER.length ? 2 : n + 1)), 1200);
    return () => clearInterval(id);
  }, []);
  const set = new Set(BOOKED_ORDER.slice(0, booked));
  const latest = BOOKED_ORDER[booked - 1];

  return (
    <svg viewBox="0 0 360 270" className="reg-scene" role="img" aria-label="A decorated marriage hall with its booking calendar filling up">
      {/* twinkling fairy lights */}
      <path d="M0 14 Q90 40 180 14 T360 14" stroke="#FDE68A" strokeOpacity=".5" fill="none" />
      {Array.from({ length: 16 }, (_, k) => {
        const x = 10 + k * 23;
        const y = 14 + 12 * Math.sin((x / 360) * Math.PI * 2 + Math.PI / 2) * -1 + 12;
        return <motion.circle key={k} cx={x} cy={y - 6} r="3" fill={k % 3 ? '#FDE68A' : '#FCA5A5'} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: (k % 5) * 0.25 }} />;
      })}

      {/* falling petals */}
      {[40, 95, 150, 205, 330].map((x, k) => (
        <motion.ellipse key={k} cx={x} cy="30" rx="3" ry="5" fill={k % 2 ? '#FB7185' : '#FBBF24'} animate={{ y: [0, 230], x: [0, k % 2 ? 18 : -18, 0], rotate: [0, 180], opacity: [0, 1, 0] }} transition={{ duration: 5 + k * 0.4, repeat: Infinity, delay: k * 0.8, ease: 'linear' }} />
      ))}

      {/* mandapam */}
      <motion.g initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <path d="M22 96 Q110 30 198 96 Z" fill="#D4A017" />
        <path d="M34 96 Q110 44 186 96 Z" fill="#7F1D1D" />
        <motion.path d="M110 26 l7 14 h-14 z" fill="#FACC15" animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }} />
        <circle cx="110" cy="44" r="5" fill="#FACC15" />
        <rect x="22" y="96" width="176" height="10" fill="#D4A017" />
        {[34, 78, 132, 176].map((x) => (
          <g key={x}>
            <rect x={x} y="106" width="10" height="112" fill="#FDE68A" />
            <rect x={x - 3} y="106" width="16" height="6" fill="#D4A017" />
            <rect x={x - 3} y="212" width="16" height="6" fill="#D4A017" />
          </g>
        ))}
        {/* swinging garland drapes */}
        {[[44, 78], [88, 132], [142, 176]].map(([a, b], k) => (
          <motion.path key={k} d={`M${a} 112 Q${(a + b) / 2} 146 ${b} 112`} stroke="#F59E0B" strokeWidth="4" strokeDasharray="1 6" strokeLinecap="round" fill="none" style={{ originX: `${(a + b) / 2}px`, originY: '112px' }} animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, delay: k * 0.3 }} />
        ))}
        {/* couple's seats */}
        <rect x="92" y="186" width="16" height="22" rx="4" fill="#DC2626" />
        <rect x="112" y="186" width="16" height="22" rx="4" fill="#DC2626" />
        <rect x="14" y="218" width="192" height="10" fill="#92400E" />
        <rect x="6" y="228" width="208" height="10" fill="#78350F" />
      </motion.g>

      {/* booking calendar card */}
      <motion.g initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1, y: [0, -4, 0] }} transition={{ x: { duration: 0.6 }, opacity: { duration: 0.6 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}>
        <rect x="222" y="70" width="128" height="150" rx="14" fill="#fff" />
        <rect x="222" y="70" width="128" height="28" rx="14" fill="#6366F1" />
        <rect x="222" y="86" width="128" height="12" fill="#6366F1" />
        <text x="234" y="89" fontSize="10" fontWeight="800" fill="#fff">Muhurtham dates</text>
        {Array.from({ length: 20 }, (_, k) => {
          const x = 230 + (k % 5) * 23.5;
          const y = 106 + Math.floor(k / 5) * 24;
          const on = set.has(k);
          return (
            <motion.g key={k} animate={k === latest ? { scale: [1, 1.25, 1] } : {}} style={{ originX: `${x + 9}px`, originY: `${y + 9}px` }} transition={{ duration: 0.4 }}>
              <rect x={x} y={y} width="19" height="19" rx="5" fill={on ? '#D4A017' : '#F1F5F9'} />
              <text x={x + 9.5} y={y + 13} fontSize="8" textAnchor="middle" fontWeight="700" fill={on ? '#fff' : '#64748B'}>{k + 1}</text>
            </motion.g>
          );
        })}
      </motion.g>

      {/* "new booking" toast */}
      <AnimatePresence mode="wait">
        <motion.g key={latest} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
          <rect x="214" y="228" width="140" height="30" rx="15" fill="#10B981" />
          <circle cx="231" cy="243" r="8" fill="#fff" />
          <path d="M227 243 l3 3 l6 -6" stroke="#10B981" strokeWidth="2" fill="none" />
          <text x="244" y="247" fontSize="9.5" fill="#fff" fontWeight="800">Date {latest + 1} booked · advance paid</text>
        </motion.g>
      </AnimatePresence>
    </svg>
  );
};

/* ------------------------------------------------------------------ layout */

const RegShowcase = ({ variant = 'moitech', children }) => {
  const th = THEMES[variant];
  const dark = variant === 'mahal';
  return (
    <MotionConfig reducedMotion="user">
      <Box className={`reg-modern reg-${variant}`} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' }, gap: { xs: 2, md: 3 }, p: { xs: 1, md: 3 }, alignItems: 'start' }}>
        <Box
          component={motion.aside}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ position: { lg: 'sticky' }, top: { lg: 16 }, borderRadius: 5, p: { xs: 2.5, md: 3.5 }, background: th.bg, color: th.ink, overflow: 'hidden', boxShadow: '0 20px 50px rgba(15,23,42,.18)' }}
        >
          <Chip label={th.badge} size="small" sx={{ bgcolor: th.chip, color: dark ? '#3B0A0A' : '#fff', fontWeight: 800, mb: 1.5 }} />
          <Typography sx={{ fontFamily: '"Noto Sans Tamil", Inter, sans-serif', fontWeight: 700, fontSize: { xs: 14, md: 15 }, opacity: 0.9 }}>{th.tamil}</Typography>
          <Typography component="h1" sx={{ fontWeight: 900, fontSize: { xs: 26, md: 34 }, lineHeight: 1.12, mt: 0.5 }}>{th.title}</Typography>
          <Typography sx={{ mt: 1, fontSize: { xs: 15, md: 16 }, opacity: 0.85 }}>
            Made for <WordTicker words={th.words} color={th.accent} />
          </Typography>

          <Box sx={{ my: { xs: 1, md: 2 }, mx: { xs: -1, md: 0 } }}>{variant === 'mahal' ? <MahalScene /> : <MoitechScene />}</Box>

          <Typography sx={{ fontSize: 15, opacity: 0.9, mb: 1.5, display: { xs: 'none', sm: 'block' } }}>{th.sub}</Typography>
          <Stack spacing={0.9}>
            {th.ticks.map((tk, i) => (
              <Stack key={tk} direction="row" spacing={1} alignItems="center" component={motion.div} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.12 }}>
                <CheckCircleRoundedIcon sx={{ color: dark ? '#FACC15' : '#10B981', fontSize: 20 }} />
                <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>{tk}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box component={motion.div} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {children}
        </Box>
      </Box>
    </MotionConfig>
  );
};

export default RegShowcase;
