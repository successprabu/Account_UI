import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import TranslateIcon from '@mui/icons-material/Translate';
import CheckIcon from '@mui/icons-material/Check';
import { useTheme as useAppTheme } from '../../ThemeProvider';
import { useLanguage } from '../../language/LanguageContext';
import { LANGUAGES } from './AppHeader';
import ConfirmDialog from '../ui/ConfirmDialog';

const FULL = 264;
const MINI = 76;
const COLLAPSE_KEY = 'ms-sidebar-collapsed';

/**
 * Navigation by role. roles: SU super admin, AU admin, NU normal user, MU mahal admin.
 * Items are links; groups hold children.
 */
const NAV = [
  { key: 'dashboard', to: '/dashboard', icon: <DashboardOutlinedIcon />, roles: ['SU', 'AU', 'NU', 'MU'] },
  { key: 'Clients', to: '/client-list', icon: <PeopleAltOutlinedIcon />, roles: ['SU'] },
  { key: 'addMahal', to: '/add-new-mahal', icon: <ApartmentOutlinedIcon />, roles: ['SU', 'MU'] },
  { key: 'mahalBooking', to: '/mahal-booking', icon: <EventAvailableOutlinedIcon />, roles: ['SU', 'MU'] },
  { key: 'mahalBookingList', to: '/mahal-booking-list', icon: <EventNoteOutlinedIcon />, roles: ['SU', 'MU'] },
  { key: 'addMoiTechCustomer', to: '/add-moitech-customer', icon: <PersonAddAltOutlinedIcon />, roles: ['SU', 'MU'] },
  {
    key: 'Masters',
    icon: <TuneOutlinedIcon />,
    roles: ['SU', 'AU'],
    children: [
      { key: 'functionMaster', to: '/function' },
      { key: 'userMaster', to: '/user' },
    ],
  },
  {
    key: 'transactions',
    icon: <ReceiptLongOutlinedIcon />,
    roles: ['SU', 'AU', 'NU'],
    children: [
      { key: 'addTransaction', to: '/transaction' },
      { key: 'transactionList', to: '/transaction-list' },
      { key: 'addExpenses', to: '/addExpenses' },
      { key: 'expensesList', to: '/expenses-list' },
      { key: 'addOthers', to: '/others' },
      { key: 'othersList', to: '/others-list' },
      { key: 'handOver', to: '/handover' },
    ],
  },
  {
    key: 'Reports',
    icon: <AssessmentOutlinedIcon />,
    roles: ['SU', 'AU'],
    children: [
      { key: 'receiptReport', to: '/income-report' },
      { key: 'expenseReport', to: '/expenses-report' },
      { key: 'othersReport', to: '/others-report' },
      { key: 'locationAmountReport', to: '/regional-report' },
      { key: 'summaryReport', to: '/summary-report' },
    ],
  },
  { key: 'Theme Settings', fallback: 'Theme settings', to: '/settings', icon: <PaletteOutlinedIcon />, roles: ['SU', 'AU', 'NU', 'MU'] },
];

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch (e) {
    return {};
  }
};

const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch (e) {
    return false;
  }
};

const itemSx = {
  borderRadius: 2,
  mx: 1.5,
  my: 0.25,
  minHeight: 44,
  color: 'text.secondary',
  '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 40 },
  '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
  '&.active': { bgcolor: 'action.selected', color: 'primary.main', fontWeight: 600 },
  '&.active .MuiListItemText-primary': { fontWeight: 600 },
};

const SidebarContent = ({ items, mini, onNavigate }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const label = (n) => t(n.key, { defaultValue: n.fallback || n.key });
  const groupActive = (g) => g.children.some((c) => pathname.startsWith(c.to));
  const [open, setOpen] = useState(() => Object.fromEntries(items.filter((i) => i.children).map((g) => [g.key, groupActive(g)])));
  const [flyout, setFlyout] = useState({ anchor: null, group: null });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box component={RouterLink} to="/dashboard" onClick={onNavigate} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: mini ? 0 : 2.5, justifyContent: mini ? 'center' : 'flex-start', height: 64, textDecoration: 'none', color: 'text.primary', flexShrink: 0 }}>
        <Box component="img" src="/logo.png" alt="" width={34} height={34} sx={{ borderRadius: 1.5 }} />
        {!mini && (
          <Typography sx={{ fontWeight: 700, fontSize: 18 }} noWrap>
            {t('my_accounts', { defaultValue: 'My Success' })}
          </Typography>
        )}
      </Box>
      <Divider />
      <List component="nav" aria-label="App" sx={{ flex: 1, overflowY: 'auto', py: 1.5 }}>
        {items.map((n) => {
          if (!n.children) {
            const btn = (
              <ListItemButton key={n.key} component={NavLink} to={n.to} onClick={onNavigate} sx={{ ...itemSx, justifyContent: mini ? 'center' : 'flex-start', px: mini ? 0 : 1.5 }}>
                <ListItemIcon sx={{ justifyContent: 'center' }}>{n.icon}</ListItemIcon>
                {!mini && <ListItemText primary={label(n)} primaryTypographyProps={{ fontSize: 14.5, noWrap: true }} />}
              </ListItemButton>
            );
            return mini ? (
              <Tooltip key={n.key} title={label(n)} placement="right">
                {btn}
              </Tooltip>
            ) : (
              btn
            );
          }
          const active = groupActive(n);
          if (mini) {
            return (
              <Tooltip key={n.key} title={label(n)} placement="right">
                <ListItemButton
                  onClick={(e) => setFlyout({ anchor: e.currentTarget, group: n })}
                  sx={{ ...itemSx, justifyContent: 'center', px: 0, ...(active && { color: 'primary.main', bgcolor: 'action.selected' }) }}
                  aria-haspopup="menu"
                >
                  <ListItemIcon sx={{ justifyContent: 'center' }}>{n.icon}</ListItemIcon>
                </ListItemButton>
              </Tooltip>
            );
          }
          return (
            <Box key={n.key}>
              <ListItemButton onClick={() => setOpen((o) => ({ ...o, [n.key]: !o[n.key] }))} sx={{ ...itemSx, px: 1.5, ...(active && { color: 'text.primary' }) }} aria-expanded={!!open[n.key]}>
                <ListItemIcon>{n.icon}</ListItemIcon>
                <ListItemText primary={label(n)} primaryTypographyProps={{ fontSize: 14.5, fontWeight: active ? 600 : 500, noWrap: true }} />
                <ExpandMoreIcon fontSize="small" sx={{ transition: 'transform .2s', transform: open[n.key] ? 'rotate(180deg)' : 'none' }} />
              </ListItemButton>
              <Collapse in={!!open[n.key]} unmountOnExit>
                <List disablePadding>
                  {n.children.map((c) => (
                    <ListItemButton key={c.key} component={NavLink} to={c.to} onClick={onNavigate} sx={{ ...itemSx, pl: 7, minHeight: 38 }}>
                      <ListItemText primary={label(c)} primaryTypographyProps={{ fontSize: 14, noWrap: true }} />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Box>
          );
        })}
      </List>
      <Menu anchorEl={flyout.anchor} open={Boolean(flyout.anchor)} onClose={() => setFlyout({ anchor: null, group: null })} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        {flyout.group && (
          <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
            {label(flyout.group)}
          </Typography>
        )}
        {flyout.group?.children.map((c) => (
          <MenuItem key={c.key} component={NavLink} to={c.to} onClick={() => setFlyout({ anchor: null, group: null })} sx={{ minWidth: 200, '&.active': { color: 'primary.main', fontWeight: 600 } }}>
            {label(c)}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

/** Layout for signed-in users: role-based sidebar, top bar, and the page. */
const AppShell = ({ children }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const app = useAppTheme();
  const { language, changeLanguage } = useLanguage() || {};
  const user = useMemo(readUser, []);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(null);
  const [langMenu, setLangMenu] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const side = app?.sidebarPosition === 'right' ? 'right' : 'left';
  const items = useMemo(() => NAV.filter((n) => n.roles.includes(user.userType)), [user.userType]);
  const mini = desktop && collapsed;
  const width = mini ? MINI : FULL;

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch (e) {
      /* storage unavailable */
    }
  }, [collapsed]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const logout = () => {
    localStorage.removeItem('user');
    setConfirmLogout(false);
    navigate('/login');
  };

  const initials = (user.name || '?')
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const paperSx = { width, boxSizing: 'border-box', borderColor: 'divider', bgcolor: 'background.paper', transition: 'width .2s', overflowX: 'hidden' };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: side === 'right' ? 'row-reverse' : 'row', bgcolor: 'background.default' }}>
      {desktop ? (
        <Drawer variant="permanent" anchor={side} sx={{ width, flexShrink: 0, transition: 'width .2s', '& .MuiDrawer-paper': paperSx }}>
          <SidebarContent items={items} mini={mini} />
        </Drawer>
      ) : (
        <Drawer variant="temporary" anchor={side} open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { ...paperSx, width: FULL } }}>
          <SidebarContent items={items} mini={false} onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky">
          <Toolbar sx={{ gap: 1, minHeight: { xs: 60, md: 64 }, px: { xs: 1.5, md: 3 } }}>
            <Tooltip title={desktop ? (collapsed ? 'Expand menu' : 'Collapse menu') : 'Open menu'}>
              <IconButton onClick={() => (desktop ? setCollapsed((c) => !c) : setMobileOpen(true))} aria-label="Toggle menu" edge="start">
                {desktop && !collapsed ? <MenuOpenIcon /> : <MenuIcon />}
              </IconButton>
            </Tooltip>
            {!desktop && (
              <Typography sx={{ fontWeight: 700 }} noWrap>
                {t('my_accounts', { defaultValue: 'My Success' })}
              </Typography>
            )}
            <Box sx={{ flex: 1 }} />

            <Tooltip title="Language">
              <IconButton onClick={(e) => setLangMenu(e.currentTarget)} aria-label="Change language" sx={{ gap: 0.75, borderRadius: 2, px: { sm: 1.25 } }}>
                <TranslateIcon fontSize="small" />
                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
                  {currentLang.label}
                </Typography>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={langMenu} open={Boolean(langMenu)} onClose={() => setLangMenu(null)}>
              {LANGUAGES.map((l) => (
                <MenuItem
                  key={l.code}
                  selected={l.code === currentLang.code}
                  onClick={() => {
                    changeLanguage && changeLanguage(l.code);
                    setLangMenu(null);
                  }}
                  sx={{ minWidth: 160, justifyContent: 'space-between', gap: 2 }}
                >
                  {l.label}
                  {l.code === currentLang.code && <CheckIcon fontSize="small" color="primary" />}
                </MenuItem>
              ))}
            </Menu>

            <Tooltip title={app?.mode === 'dark' ? 'Light mode' : 'Dark mode'}>
              <IconButton onClick={() => app?.toggleTheme?.()} aria-label="Toggle dark mode">
                {app?.mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>
            </Tooltip>

            <IconButton onClick={(e) => setUserMenu(e.currentTarget)} aria-label="Account menu" sx={{ ml: 0.5, p: 0.5, borderRadius: 2, gap: 1 }}>
              <Avatar sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 600, background: 'var(--ms-gradient)' }}>{initials}</Avatar>
              <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left', pr: 0.5 }}>
                <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ maxWidth: 160, lineHeight: 1.3 }}>
                  {user.name || 'Account'}
                </Typography>
                {user.userTypeDescription && (
                  <Typography variant="caption" color="text.secondary" noWrap component="p" sx={{ maxWidth: 160, lineHeight: 1.3 }}>
                    {user.userTypeDescription}
                  </Typography>
                )}
              </Box>
            </IconButton>
            <Menu anchorEl={userMenu} open={Boolean(userMenu)} onClose={() => setUserMenu(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
              <Stack sx={{ px: 2, py: 1, minWidth: 220 }}>
                <Typography fontWeight={600}>{user.name || 'Account'}</Typography>
                {user.userTypeDescription && (
                  <Typography variant="caption" color="text.secondary">
                    {user.userTypeDescription}
                  </Typography>
                )}
              </Stack>
              <Divider />
              <MenuItem component={RouterLink} to="/settings" onClick={() => setUserMenu(null)}>
                <ListItemIcon>
                  <PaletteOutlinedIcon fontSize="small" />
                </ListItemIcon>
                {t('Theme Settings', { defaultValue: 'Theme settings' })}
              </MenuItem>
              <MenuItem component={RouterLink} to="/contactus" onClick={() => setUserMenu(null)}>
                <ListItemIcon>
                  <HelpOutlineIcon fontSize="small" />
                </ListItemIcon>
                {t('help', { defaultValue: 'Help' })}
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setUserMenu(null);
                  setConfirmLogout(true);
                }}
                sx={{ color: 'error.main' }}
              >
                <ListItemIcon sx={{ color: 'inherit' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {t('Logout', { defaultValue: 'Log out' })}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, minWidth: 0, px: { xs: 2, md: 3 }, pb: 4 }}>
          {children}
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmLogout}
        title={t('logoutConfirmTitle', { defaultValue: 'Log out?' })}
        message={t('logoutConfirmText', { defaultValue: 'You will need your mobile number and password to sign in again.' })}
        confirmLabel={t('Logout', { defaultValue: 'Log out' })}
        onConfirm={logout}
        onClose={() => setConfirmLogout(false)}
      />
    </Box>
  );
};

export default AppShell;
