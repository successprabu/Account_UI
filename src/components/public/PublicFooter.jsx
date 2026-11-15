import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Container, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import { BrandLink } from '../common/AppHeader';
import { CONTACT, PRODUCTS } from './products';

const FooterLink = ({ to, href, children }) =>
  href ? (
    <Link href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" color="text.secondary" underline="hover" variant="body2">
      {children}
    </Link>
  ) : (
    <Link component={RouterLink} to={to} color="text.secondary" underline="hover" variant="body2">
      {children}
    </Link>
  );

const Column = ({ title, children }) => (
  <Stack spacing={1.25}>
    <Typography variant="subtitle2" color="text.primary" sx={{ mb: 0.5 }}>
      {title}
    </Typography>
    {children}
  </Stack>
);

/** Footer for all public pages. */
const PublicFooter = () => {
  const { t } = useTranslation();
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', mt: 'auto' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <BrandLink />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 320 }}>
              We help businesses modernize, go digital and grow with AI, in English and five Indian languages.
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Column title="Products">
              {PRODUCTS.map((p) => (
                <FooterLink key={p.id} to={p.cta.to ? `/services#${p.id}` : undefined} href={p.cta.href}>
                  {t(p.titleKey, { defaultValue: p.title })}
                  {p.comingSoon ? ' (coming soon)' : ''}
                </FooterLink>
              ))}
            </Column>
          </Grid>
          <Grid item xs={6} md={2}>
            <Column title="Company">
              <FooterLink to="/about">{t('about_us', { defaultValue: 'About' })}</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/contactus">{t('contact_us', { defaultValue: 'Contact' })}</FooterLink>
              <FooterLink to="/login">{t('login', { defaultValue: 'Login' })}</FooterLink>
            </Column>
          </Grid>
          <Grid item xs={12} md={3}>
            <Column title="Contact">
              <FooterLink href={`mailto:${CONTACT.email}`}>{CONTACT.email}</FooterLink>
              <FooterLink href={`tel:${CONTACT.phoneTel}`}>{CONTACT.phoneDisplay}</FooterLink>
              <Typography variant="body2" color="text.secondary">
                {CONTACT.city}
              </Typography>
            </Column>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4 }} />
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} MySuccess Technologies. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default PublicFooter;
