import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Chip, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TranslateIcon from '@mui/icons-material/Translate';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AppHeader from '../common/AppHeader';
import PublicFooter from '../public/PublicFooter';
import { Section, CtaBand, IconTile } from '../public/Section';
import { PRODUCTS } from '../public/products';
import { StatusChip } from '../ui';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Illustration of the Moitech screen for the hero (sample figures).
const ProductPreview = () => (
  <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, boxShadow: 'var(--ms-shadow-lg)' }} aria-label="Moitech screen preview">
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Moitech · Function summary
        </Typography>
        <Typography variant="h5" component="p">
          திருமண விழா · Thiruvarur
        </Typography>
      </Box>
      <Chip label="Live" size="small" color="success" variant="outlined" />
    </Stack>
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      {[
        ['Moi received', inr(184500), 'primary.main'],
        ['Expenses', inr(62300), 'warning.main'],
        ['Entries', '246', 'success.main'],
      ].map(([label, value, color]) => (
        <Grid item xs={4} key={label}>
          <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'background.default', border: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary" noWrap component="p">
              {label}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 15, sm: 19 }, color, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
    <Stack divider={<Divider flexItem />} sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5 }}>
      {[
        ['முருகன் K', 'Mannargudi', 5000, 'Paid'],
        ['Lakshmi Devi', 'Kumbakonam', 2500, 'Paid'],
        ['செல்வி R', 'Needamangalam', 1500, 'Pending'],
      ].map(([name, village, amount, st]) => (
        <Stack key={name} direction="row" alignItems="center" spacing={1.5} sx={{ px: 1.5, py: 1.25 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {village}
            </Typography>
          </Box>
          <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {inr(amount)}
          </Typography>
          <StatusChip label={st} tone={st === 'Paid' ? 'success' : 'warning'} />
        </Stack>
      ))}
    </Stack>
  </Card>
);

const STEPS = [
  { n: '1', title: 'Register for the demo', text: 'Sign up with your mobile number. The 7-day trial needs no card.' },
  { n: '2', title: 'Add your entries', text: 'Type names in Tamil or English on a phone, tablet or computer.' },
  { n: '3', title: 'Share the reports', text: 'Totals update as you go. Download PDF or Excel reports when you are done.' },
];

const FEATURES = [
  { icon: <TranslateIcon />, color: '#6366f1', title: 'Six languages', text: 'English, Tamil, Hindi, Telugu, Kannada and Malayalam.' },
  { icon: <KeyboardOutlinedIcon />, color: '#8b5cf6', title: 'Tamil typing', text: 'Type a name in English letters and get it in Tamil script.' },
  { icon: <PhoneIphoneOutlinedIcon />, color: '#10b981', title: 'Works on any device', text: 'Use it on a phone at the function or on a computer at the office.' },
  { icon: <DescriptionOutlinedIcon />, color: '#f59e0b', title: 'PDF and Excel reports', text: 'Income, expense, village-wise and summary reports, ready to print.' },
  { icon: <AdminPanelSettingsOutlinedIcon />, color: '#0ea5e9', title: 'Roles for your team', text: 'Separate access for owners, admins and the people taking entries.' },
  { icon: <PaymentsOutlinedIcon />, color: '#ef4444', title: 'Simple pricing', text: 'Start free, then plans from ₹99 a month. Pay by UPI, card or net banking.' },
];

const Home = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 6, md: 10 }, pb: { xs: 7, md: 11 } }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(60% 50% at 85% 10%, rgba(139,92,246,0.14) 0%, transparent 70%), radial-gradient(50% 40% at 10% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="Made for Tamil Nadu and South India" variant="outlined" color="primary" sx={{ mb: 2.5, bgcolor: 'background.paper' }} />
              <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 34, sm: 44, md: 52 }, letterSpacing: '-0.02em' }}>
                Run functions, halls and schools{' '}
                <Box component="span" sx={{ background: 'var(--ms-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  without the paperwork
                </Box>
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2.5, fontSize: { xs: 17, md: 19 }, maxWidth: 540 }}>
                MySuccess keeps moi records, hall bookings and school office work in one simple app, in your language, on any phone or computer.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
                <Button component={RouterLink} to="/purchase" variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
                  {t('watchDemo', { defaultValue: 'Try Demo' })}
                </Button>
                <Button component={RouterLink} to="/services" variant="outlined" color="inherit" size="large">
                  See the products
                </Button>
              </Stack>
              <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                {['7-day free trial', 'No card needed', 'Plans from ₹99/month'].map((x) => (
                  <Stack key={x} direction="row" spacing={0.75} alignItems="center">
                    <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {x}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <ProductPreview />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Products */}
      <Section tinted eyebrow="Products" title="Three apps, one account" intro="Pick the one you need today. Everything shares the same login, languages and reports.">
        <Grid container spacing={3}>
          {PRODUCTS.map((p) => (
            <Grid item xs={12} md={4} key={p.id}>
              <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow .2s, transform .2s', '&:hover': { boxShadow: 'var(--ms-shadow-md)', transform: 'translateY(-2px)' } }}>
                <IconTile color={p.color}>{p.icon}</IconTile>
                <Typography variant="h4" component="h3" sx={{ mt: 2.5 }}>
                  {t(p.titleKey, { defaultValue: p.title })}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, flex: 1 }}>
                  {p.summary}
                </Typography>
                <Button
                  {...(p.cta.href ? { href: p.cta.href, target: '_blank', rel: 'noopener noreferrer' } : { component: RouterLink, to: p.cta.to })}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mt: 2.5, alignSelf: 'flex-start', px: 0, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}
                >
                  {p.cta.label}
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* How it works */}
      <Section eyebrow="How it works" title="Up and running in one evening">
        <Grid container spacing={3}>
          {STEPS.map((s) => (
            <Grid item xs={12} md={4} key={s.n}>
              <Stack spacing={1.5}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--ms-gradient)', color: '#fff', fontWeight: 700 }}>
                  {s.n}
                </Box>
                <Typography variant="h5" component="h3">
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {s.text}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* What's included */}
      <Section tinted eyebrow="What you get" title="Built for the way you work">
        <Grid container spacing={3}>
          {FEATURES.map((f) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Stack direction="row" spacing={2}>
                <IconTile color={f.color} size={44}>
                  {f.icon}
                </IconTile>
                <Box>
                  <Typography variant="h6" component="h3">
                    {f.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {f.text}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Section>

      <CtaBand
        title="Try MySuccess free for 7 days"
        text="Register with your mobile number and record your first function today. Upgrade only if it helps."
        actions={
          <>
            <Button component={RouterLink} to="/purchase" size="large" variant="contained" sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f1f5f9' } }}>
              {t('watchDemo', { defaultValue: 'Try Demo' })}
            </Button>
            <Button component={RouterLink} to="/pricing" size="large" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
              See pricing
            </Button>
          </>
        }
      />

      <PublicFooter />
    </Box>
  );
};

export default Home;
