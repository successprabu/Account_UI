import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckIcon from '@mui/icons-material/Check';
import { CtaBand, IconTile } from '../public/Section';
import { PRODUCTS } from '../public/products';

const ProductBlock = ({ product, reverse }) => {
  const { t } = useTranslation();
  const p = product;
  const ctaProps = p.cta.href ? { href: p.cta.href, target: '_blank', rel: 'noopener noreferrer', endIcon: <OpenInNewIcon /> } : { component: RouterLink, to: p.cta.to, endIcon: <ArrowForwardIcon /> };
  return (
    <Box component="section" id={p.id} sx={{ py: { xs: 6, md: 8 }, scrollMarginTop: 80 }}>
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="flex-start" direction={reverse ? 'row-reverse' : 'row'}>
          <Grid item xs={12} md={6}>
            <IconTile color={p.color} size={56}>
              {p.icon}
            </IconTile>
            <Typography variant="overline" sx={{ display: 'block', mt: 2.5, color: p.color }}>
              {p.tagline}
            </Typography>
            <Typography variant="h2" component="h2" sx={{ mt: 0.5 }}>
              {t(p.titleKey, { defaultValue: p.title })}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2, fontSize: 17 }}>
              {t(p.descriptionKey, { defaultValue: p.summary })}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5 }}>
              <Button variant="contained" size="large" {...ctaProps}>
                {p.cta.label}
              </Button>
              <Button component={RouterLink} to="/pricing" variant="outlined" color="inherit" size="large">
                Pricing
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 4 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                What it does
              </Typography>
              <Stack spacing={1.75}>
                {p.features.map((f) => (
                  <Stack key={f} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: `${p.color}1a`, color: p.color, flexShrink: 0, mt: '1px' }}>
                      <CheckIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Typography>{f}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const ServicePage = () => {
  const { t } = useTranslation();
  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <Box component="section" sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 2, md: 3 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="overline" color="primary.main">
            {t('ourServices', { defaultValue: 'Our products' })}
          </Typography>
          <Typography variant="h1" component="h1" sx={{ fontSize: { xs: 32, md: 44 }, mt: 1 }}>
            Software for the work you already do
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 2, fontSize: 18 }}>
            Moi accounting for functions, bookings for marriage halls and office tools for schools. Each one works in six languages and on any device.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 3.5 }}>
            {PRODUCTS.map((p) => (
              <Chip key={p.id} component="a" href={`#${p.id}`} clickable label={t(p.titleKey, { defaultValue: p.title })} icon={<Box sx={{ display: 'flex', color: p.color, '& svg': { fontSize: 18 } }}>{p.icon}</Box>} variant="outlined" sx={{ bgcolor: 'background.paper', px: 0.5 }} />
            ))}
          </Stack>
        </Container>
      </Box>

      {PRODUCTS.map((p, i) => (
        <Box key={p.id} sx={{ bgcolor: i % 2 === 1 ? 'background.paper' : 'transparent', borderBlock: i % 2 === 1 ? 1 : 0, borderColor: 'divider' }}>
          <ProductBlock product={p} reverse={i % 2 === 1} />
        </Box>
      ))}

      <CtaBand
        title="Not sure which one fits?"
        text="Call or message us and we will set it up with you, in Tamil or English."
        actions={
          <>
            <Button component={RouterLink} to="/contactus" size="large" variant="contained" sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f1f5f9' } }}>
              {t('contact_us', { defaultValue: 'Contact us' })}
            </Button>
            <Button component={RouterLink} to="/purchase" size="large" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
              {t('watchDemo', { defaultValue: 'Try Demo' })}
            </Button>
          </>
        }
      />
    </Box>
  );
};

export default ServicePage;
