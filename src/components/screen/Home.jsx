import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Chip, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import CloudSyncOutlinedIcon from '@mui/icons-material/CloudSyncOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import PhoneIphoneOutlinedIcon from '@mui/icons-material/PhoneIphoneOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AppHeader from '../common/AppHeader';
import PublicFooter from '../public/PublicFooter';
import { Section, CtaBand, IconTile } from '../public/Section';
import { PRODUCTS } from '../public/products';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

// Illustration of a business dashboard for the hero (sample figures).
const DashboardPreview = () => (
  <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, boxShadow: 'var(--ms-shadow-lg)' }} aria-label="Business dashboard preview">
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          MySuccess · Business overview
        </Typography>
        <Typography variant="h5" component="p">
          This month
        </Typography>
      </Box>
      <Chip label="Live" size="small" color="success" variant="outlined" />
    </Stack>
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      {[
        ['Sales', inr(482000), 'primary.main'],
        ['Customers', '1,240', 'success.main'],
        ['Tasks automated', '128', 'secondary.main'],
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
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 1.5, py: 1.25 }}>
        <AutoAwesomeIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
        <Typography variant="body2" fontWeight={600}>
          AI insights
        </Typography>
      </Stack>
      <Divider />
      <Stack divider={<Divider flexItem />}>
        {[
          ['Weekend sales are rising', 'Plan extra staff for Saturday'],
          ['3 invoices are overdue', 'Reminders are ready to send'],
          ['Top product is running low', 'Reorder before Friday'],
        ].map(([title, action]) => (
          <Stack key={title} direction="row" alignItems="center" spacing={1.5} sx={{ px: 1.5, py: 1.25 }}>
            <TrendingUpIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {action}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Box>
  </Card>
);

const SERVICES = [
  {
    icon: <RocketLaunchOutlinedIcon />,
    color: '#6366f1',
    title: 'Modernize',
    text: 'Websites, web apps and mobile-friendly tools that give your business a professional face and a faster way to work.',
    points: ['Business websites', 'Custom web apps', 'Online booking and payments'],
  },
  {
    icon: <CloudSyncOutlinedIcon />,
    color: '#10b981',
    title: 'Digitize',
    text: 'Move notebooks, spreadsheets and paper files into secure cloud software your whole team can use from anywhere.',
    points: ['Records, billing and accounts', 'Reports in PDF and Excel', 'Access for your whole team'],
  },
  {
    icon: <PsychologyOutlinedIcon />,
    color: '#8b5cf6',
    title: 'Improve with AI',
    text: 'Put your data to work: spot trends, automate routine tasks and get suggestions that help you decide faster.',
    points: ['Insights from your data', 'Automated routine work', 'Smart reading of documents'],
  },
];

const STEPS = [
  { n: '1', title: 'Tell us about your business', text: 'A free call to understand how you work today and where time and money are lost.' },
  { n: '2', title: 'We digitize and set it up', text: 'We build or configure the right tools, move your data in and train your team.' },
  { n: '3', title: 'Grow with AI insights', text: 'Use reports and AI suggestions to cut manual work and make better decisions.' },
];

const FEATURES = [
  { icon: <TranslateIcon />, color: '#6366f1', title: 'Your language', text: 'English, Tamil, Hindi, Telugu, Kannada and Malayalam.' },
  { icon: <PhoneIphoneOutlinedIcon />, color: '#10b981', title: 'Works on any device', text: 'Phone, tablet or computer, in the office or on the move.' },
  { icon: <DescriptionOutlinedIcon />, color: '#f59e0b', title: 'Ready-made reports', text: 'Download clear reports as PDF or Excel whenever you need them.' },
  { icon: <AdminPanelSettingsOutlinedIcon />, color: '#0ea5e9', title: 'Roles for your team', text: 'Give owners, managers and staff the access each one needs.' },
  { icon: <LockOutlinedIcon />, color: '#8b5cf6', title: 'Secure in the cloud', text: 'Your data is stored online with secure sign-in, not on one computer.' },
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
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                label="Modernize · Digitize · AI"
                variant="outlined"
                color="primary"
                sx={{ mb: 2.5, bgcolor: 'background.paper' }}
              />
              <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 34, sm: 44, md: 52 }, letterSpacing: '-0.02em' }}>
                Take your business digital and{' '}
                <Box component="span" sx={{ background: 'var(--ms-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  grow it with AI
                </Box>
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2.5, fontSize: { xs: 17, md: 19 }, maxWidth: 540 }}>
                MySuccess modernizes the way you work: we replace paperwork with simple cloud software, automate daily tasks and use AI to help you make better decisions.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
                <Button component={RouterLink} to="/purchase" variant="contained" size="large" endIcon={<ArrowForwardIcon />}>
                  {t('watchDemo', { defaultValue: 'Try Demo' })}
                </Button>
                <Button component={RouterLink} to="/contactus" variant="outlined" color="inherit" size="large">
                  Talk to us
                </Button>
              </Stack>
              <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
                {['Free consultation', '7-day free trial', 'Plans from ₹99/month'].map((x) => (
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
              <DashboardPreview />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services */}
      <Section tinted eyebrow="What we do" title="Modernize, digitize and improve with AI" intro="Whatever your size or industry, we help you move from manual work to smart, connected software.">
        <Grid container spacing={3}>
          {SERVICES.map((s) => (
            <Grid item xs={12} md={4} key={s.title}>
              <Card sx={{ p: 3, height: '100%' }}>
                <IconTile color={s.color}>{s.icon}</IconTile>
                <Typography variant="h4" component="h3" sx={{ mt: 2.5 }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {s.text}
                </Typography>
                <Stack spacing={1} sx={{ mt: 2.5 }}>
                  {s.points.map((p) => (
                    <Stack key={p} direction="row" spacing={1} alignItems="center">
                      <CheckCircleIcon sx={{ fontSize: 18, color: s.color }} />
                      <Typography variant="body2">{p}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      {/* How it works */}
      <Section eyebrow="How it works" title="From paperwork to smart software in three steps">
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

      {/* Ready-made products */}
      <Section tinted eyebrow="Ready-made products" title="Start today with our apps" intro="Use one of our ready-to-run products, or let us build something made for your business. Healthcare software is next on our roadmap.">
        <Grid container spacing={3}>
          {PRODUCTS.map((p) => (
            <Grid item xs={12} sm={6} lg={3} key={p.id}>
              <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'box-shadow .2s, transform .2s', '&:hover': { boxShadow: 'var(--ms-shadow-md)', transform: 'translateY(-2px)' } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <IconTile color={p.color}>{p.icon}</IconTile>
                  {p.comingSoon && <Chip label="Coming soon" size="small" color="error" variant="outlined" />}
                </Stack>
                <Typography variant="h5" component="h3" sx={{ mt: 2.5 }}>
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

      {/* What's included */}
      <Section eyebrow="Included with every product" title="Built for the way you work">
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
        title="Ready to modernize your business?"
        text="Tell us how you work today. We will show you what to digitize first and where AI can save you time."
        actions={
          <>
            <Button component={RouterLink} to="/contactus" size="large" variant="contained" sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f1f5f9' } }}>
              Book a free consultation
            </Button>
            <Button component={RouterLink} to="/purchase" size="large" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
              {t('watchDemo', { defaultValue: 'Try Demo' })}
            </Button>
          </>
        }
      />

      <PublicFooter />
    </Box>
  );
};

export default Home;
