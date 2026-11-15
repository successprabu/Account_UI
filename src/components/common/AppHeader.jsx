import { useState } from 'react';
import { NavLink, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useLanguage } from '../../language/LanguageContext';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
];

const NAV = [
  { to: '/', key: 'home', fallback: 'Home', end: true },
  { to: '/services', key: 'ourServices', fallback: 'Products' },
  { to: '/pricing', key: 'pricing', fallback: 'Pricing' },
  { to: '/about', key: 'about_us', fallback: 'About' },
  { to: '/contactus', key: 'contact_us', fallback: 'Contact' },
];

const navSx = {
  color: 'text.secondary',
  fontWeight: 500,
  fontSize: 15,
  px: 1.5,
  py: 1,
  borderRadius: 2,
  textDecoration: 'none',
  '&:hover': { color: 'text.primary', bgcolor: 'action.hover' },
  '&.active': { color: 'primary.main', fontWeight: 600 },
};

const LanguageMenu = ({ fullWidth = false }) => {
  const { language, changeLanguage } = useLanguage() || {};
  const [anchor, setAnchor] = useState(null);
  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];
  return (
    <>
      <Button
        color="inherit"
        variant={fullWidth ? 'outlined' : 'text'}
        fullWidth={fullWidth}
        startIcon={<TranslateIcon fontSize="small" />}
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-label="Change language"
        aria-haspopup="menu"
        sx={{ color: 'text.secondary', fontWeight: 500 }}
      >
        {current.label}
      </Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {LANGUAGES.map((l) => (
          <MenuItem
            key={l.code}
            selected={l.code === current.code}
            onClick={() => {
              changeLanguage && changeLanguage(l.code);
              setAnchor(null);
            }}
            sx={{ minWidth: 160, justifyContent: 'space-between', gap: 2 }}
          >
            {l.label}
            {l.code === current.code && <CheckIcon fontSize="small" color="primary" />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export const BrandLink = () => {
  const { t } = useTranslation();
  return (
    <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.25, textDecoration: 'none', color: 'text.primary' }}>
      <Box component="img" src="/logo.png" alt="" width={36} height={36} sx={{ borderRadius: 1.5 }} />
      <Typography component="span" sx={{ fontWeight: 700, fontSize: 19, letterSpacing: '-0.01em' }}>
        {t('my_accounts', { defaultValue: 'My Success' })}
      </Typography>
    </Box>
  );
};

/** Header for all public pages: brand, navigation, language, login and demo. */
const AppHeader = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <AppBar position="sticky" sx={{ backdropFilter: 'saturate(180%) blur(8px)', bgcolor: (th) => `${th.palette.background.paper}e6` }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          <BrandLink />

          <Stack component="nav" direction="row" spacing={0.5} sx={{ ml: 4, display: { xs: 'none', md: 'flex' } }} aria-label="Main">
            {NAV.map((n) => (
              <Box key={n.to} component={NavLink} to={n.to} end={n.end} sx={navSx}>
                {t(n.key, { defaultValue: n.fallback })}
              </Box>
            ))}
          </Stack>

          <Box sx={{ flex: 1 }} />

          <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
            <LanguageMenu />
            <Button component={RouterLink} to="/login" variant="outlined" color="inherit">
              {t('login', { defaultValue: 'Login' })}
            </Button>
            <Button component={RouterLink} to="/purchase" variant="contained">
              {t('watchDemo', { defaultValue: 'Try Demo' })}
            </Button>
          </Stack>

          <IconButton sx={{ display: { md: 'none' } }} onClick={() => setOpen(true)} aria-label="Open menu">
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: 300, p: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <BrandLink />
          <IconButton onClick={() => setOpen(false)} aria-label="Close menu">
            <CloseIcon />
          </IconButton>
        </Stack>
        <List component="nav" aria-label="Main">
          {NAV.map((n) => (
            <ListItemButton key={n.to} component={NavLink} to={n.to} end={n.end} onClick={() => setOpen(false)} sx={{ borderRadius: 2, '&.active': { color: 'primary.main', bgcolor: 'action.selected' } }}>
              <ListItemText primary={t(n.key, { defaultValue: n.fallback })} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.5}>
          <LanguageMenu fullWidth />
          <Button component={RouterLink} to="/login" variant="outlined" color="inherit" fullWidth onClick={() => setOpen(false)}>
            {t('login', { defaultValue: 'Login' })}
          </Button>
          <Button component={RouterLink} to="/purchase" variant="contained" fullWidth onClick={() => setOpen(false)}>
            {t('watchDemo', { defaultValue: 'Try Demo' })}
          </Button>
        </Stack>
      </Drawer>
    </AppBar>
  );
};

export default AppHeader;
