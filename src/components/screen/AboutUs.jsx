import { useTx } from '../../language/site';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AppHeader from '../common/AppHeader';
import PublicFooter from '../public/PublicFooter';
import { Section, IconTile } from '../public/Section';
import { CONTACT, PRODUCTS } from '../public/products';

const VALUES = [
  { icon: <TranslateIcon />, color: '#6366f1', title: 'Your language first', text: 'Every screen works in English, Tamil, Hindi, Telugu, Kannada and Malayalam.' },
  { icon: <SpeedOutlinedIcon />, color: '#10b981', title: 'Simple to learn', text: 'Clear screens and plain words, made for people who are not computer experts.' },
  { icon: <CurrencyRupeeIcon />, color: '#f59e0b', title: 'Fair pricing', text: 'Start free. Paid plans are priced for families, halls and small schools.' },
  { icon: <SupportAgentOutlinedIcon />, color: '#8b5cf6', title: 'People you can call', text: 'Reach us by phone, email or WhatsApp when you need help.' },
];

const AboutUs = () => {
  const tx = useTx();
  const { t } = useTranslation();
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppHeader />

      <Box component="section" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 5, md: 8 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="overline" color="primary.main">
            {t('about_us', { defaultValue: 'About us' })}
          </Typography>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 32, md: 44 }, mt: 1 }}>
            {tx("We build simple software for real community work")}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2.5, fontSize: 18 }}>
            {tx('MySuccess Technologies is a software team based in {{city}}. We make tools that replace the notebook and calculator: moi collection at family functions, bookings at marriage halls and office work at schools.', { city: tx(CONTACT.city.split(',')[0]) })}
          </Typography>
        </Container>
      </Box>

      <Section tinted eyebrow={tx("What we build")} title={tx("Our products")}>
        <Grid container spacing={3} columns={{ xs: 12, lg: 15 }}>
          {PRODUCTS.map((p) => (
            <Grid item xs={12} sm={6} lg={3} key={p.id}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <IconTile color={p.color}>{p.icon}</IconTile>
                  {p.comingSoon && <Chip label={tx("Coming soon")} size="small" color="error" variant="outlined" />}
                </Stack>
                <Typography variant="h5" component="h3" sx={{ mt: 2 }}>
                  {t(p.titleKey, { defaultValue: p.title })}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tx(p.tagline)}.
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button component={RouterLink} to="/services" variant="outlined" color="inherit">
            {tx("Explore the products")}
          </Button>
        </Box>
      </Section>

      <Section eyebrow={tx("How we work")} title={tx("What we care about")}>
        <Grid container spacing={3}>
          {VALUES.map((v) => (
            <Grid item xs={12} sm={6} key={tx(v.title)}>
              <Stack direction="row" spacing={2}>
                <IconTile color={v.color} size={44}>
                  {v.icon}
                </IconTile>
                <Box>
                  <Typography variant="h6" component="h3">
                    {tx(v.title)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {tx(v.text)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Section>

      <Section tinted eyebrow={tx("Get in touch")} title={tx("Talk to us")}>
        <Grid container spacing={3}>
          {[
            { icon: <MailOutlineIcon />, color: '#6366f1', label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
            { icon: <PhoneOutlinedIcon />, color: '#10b981', label: 'Phone', value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phoneTel}` },
            { icon: <PlaceOutlinedIcon />, color: '#f59e0b', label: 'Office', value: CONTACT.city },
          ].map((c) => (
            <Grid item xs={12} md={4} key={tx(c.label)}>
              <Card sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconTile color={c.color} size={44}>
                    {c.icon}
                  </IconTile>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" color="text.secondary">
                      {tx(c.label)}
                    </Typography>
                    {c.href ? (
                      <Typography component="a" href={c.href} sx={{ fontWeight: 600, color: 'text.primary', textDecoration: 'none', wordBreak: 'break-word', '&:hover': { color: 'primary.main' } }}>
                        {c.value}
                      </Typography>
                    ) : (
                      <Typography fontWeight={600}>{tx(c.value)}</Typography>
                    )}
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Section>

      <PublicFooter />
    </Box>
  );
};

export default AboutUs;
