import { useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Alert, Snackbar, Fade, Breadcrumbs, Link } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { CheckCircle, Home as HomeIcon, NavigateNext, Settings as SettingsIcon, ColorLens } from '@mui/icons-material';
import { colorPalettes } from '../../theme/themeConfig';
import { useTheme as useAppTheme } from '../../ThemeProvider';
import { Link as RouterLink } from 'react-router-dom';

const ThemeSettingsPage = () => {
  // Prefer ThemeProvider hook; fallback to global window provider
  const provider = useAppTheme() || (typeof window !== 'undefined' ? window.__THEME_PROVIDER : null);
  const themeState = provider || { mode: 'light', colorScheme: 'mysuccess', sidebarPosition: 'left' };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handlePositionChange = (newPosition) => {
    if (!provider) return;
    if (typeof provider.setSidebarPosition === 'function') provider.setSidebarPosition(newPosition);
    const positionNames = { left: 'Left Sidebar', right: 'Right Sidebar', top: 'Top Navigation' };
    setSnackbarMessage(`Navigation changed to ${positionNames[newPosition]}`);
    setSnackbarOpen(true);
  };

  const handleColorSchemeChange = (scheme) => {
    if (!provider) return;
    if (typeof provider.setColorScheme === 'function') provider.setColorScheme(scheme);
    const schemeNames = {
      mysuccess: 'MySuccess (default)',
      dentalBlue: 'Dental Blue',
      dentalGreen: 'Dental Green',
      dentalTeal: 'Dental Teal',
      dentalPurple: 'Dental Purple',
      professionalDark: 'Professional Dark',
      warm: 'Warm',
      minimal: 'Minimal',
      elegant: 'Elegant',
      midnightBlue: 'Midnight Blue',
      forestGreen: 'Forest Green',
      royalPurple: 'Royal Purple',
      charcoal: 'Charcoal',
      ocean: 'Ocean Deep',
      sunset: 'Sunset Orange',
      mint: 'Mint Fresh',
      coral: 'Coral Pink',
    };
    setSnackbarMessage(`${schemeNames[scheme]} theme activated`);
    setSnackbarOpen(true);
  };

  const handleThemeToggle = () => {
    if (!provider) return;
    if (typeof provider.toggleTheme === 'function') provider.toggleTheme();
    setSnackbarMessage(`Switched theme mode`);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  const { mode, colorScheme, sidebarPosition } = themeState;

  return (
    <Box sx={{ pt: { xs: 2, md: 3 }, pb: 4 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Breadcrumbs 
          separator={<NavigateNext fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Link
            component={RouterLink}
            to="/settings"
            sx={{ display: 'flex', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}
          >
            <SettingsIcon sx={{ mr: 0.5 }} fontSize="small" />
            Settings
          </Link>
          <Typography color="textPrimary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ColorLens sx={{ mr: 0.5 }} fontSize="small" />
            Theme Settings
          </Typography>
        </Breadcrumbs>
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Theme Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Customize the appearance of your application
        </Typography>
      </Box>

      <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: `1px solid #e0e0e0` }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Typography variant="h6" fontWeight="bold">Current Settings</Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">Theme Mode</Typography>
                <Typography variant="body1" fontWeight="bold">{mode === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">Color Scheme</Typography>
                <Typography variant="body1" fontWeight="bold">{colorScheme}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">Navigation Position</Typography>
                <Typography variant="body1" fontWeight="bold">{sidebarPosition}</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Appearance Mode Section */}
      <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: `1px solid #e0e0e0` }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={3}>
            <Typography variant="h6" fontWeight="bold">Appearance Mode</Typography>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box onClick={() => { if (mode !== 'light') handleThemeToggle(); }} sx={{ cursor: 'pointer', p: 3, borderRadius: 3, transition: 'all 0.3s', border: mode === 'light' ? 2 : 1, borderColor: mode === 'light' ? '#1976d2' : '#e0e0e0', bgcolor: mode === 'light' ? alpha('#1976d2', 0.06) : 'background.paper', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Light Mode</Typography>
                  {mode === 'light' && <CheckCircle sx={{ color: '#1976d2' }} />}
                </Box>
                <Typography variant="body2" color="text.secondary">Bright and clean interface</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box onClick={() => { if (mode !== 'dark') handleThemeToggle(); }} sx={{ cursor: 'pointer', p: 3, borderRadius: 3, transition: 'all 0.3s', border: mode === 'dark' ? 2 : 1, borderColor: mode === 'dark' ? '#1976d2' : '#e0e0e0', bgcolor: mode === 'dark' ? alpha('#1976d2', 0.06) : 'background.paper', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Dark Mode</Typography>
                  {mode === 'dark' && <CheckCircle sx={{ color: '#1976d2' }} />}
                </Box>
                <Typography variant="body2" color="text.secondary">Easy on the eyes for night use</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Navigation Position Section */}
      <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: `1px solid #e0e0e0` }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={3}><Typography variant="h6" fontWeight="bold">Navigation Position</Typography></Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box onClick={() => handlePositionChange('left')} sx={{ cursor: 'pointer', p: 2.5, borderRadius: 3, transition: 'all 0.3s', border: sidebarPosition === 'left' ? 2 : 1, borderColor: sidebarPosition === 'left' ? '#1976d2' : '#e0e0e0', bgcolor: sidebarPosition === 'left' ? alpha('#1976d2', 0.06) : 'background.paper', textAlign: 'center', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                <Typography variant="h6">Left Sidebar</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box onClick={() => handlePositionChange('right')} sx={{ cursor: 'pointer', p: 2.5, borderRadius: 3, transition: 'all 0.3s', border: sidebarPosition === 'right' ? 2 : 1, borderColor: sidebarPosition === 'right' ? '#1976d2' : '#e0e0e0', bgcolor: sidebarPosition === 'right' ? alpha('#1976d2', 0.06) : 'background.paper', textAlign: 'center', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                <Typography variant="h6">Right Sidebar</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box onClick={() => handlePositionChange('top')} sx={{ cursor: 'pointer', p: 2.5, borderRadius: 3, transition: 'all 0.3s', border: sidebarPosition === 'top' ? 2 : 1, borderColor: sidebarPosition === 'top' ? '#1976d2' : '#e0e0e0', bgcolor: sidebarPosition === 'top' ? alpha('#1976d2', 0.06) : 'background.paper', textAlign: 'center', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
                <Typography variant="h6">Top Navigation</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Color Schemes Section */}
      <Card elevation={0} sx={{ mb: 4, borderRadius: 3, border: `1px solid #e0e0e0` }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={3}><Typography variant="h6" fontWeight="bold">Color Schemes</Typography></Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choose a color theme</Typography>
          <Grid container spacing={2}>
            {Object.entries(colorPalettes).map(([scheme, colors]) => (
              <Grid item xs={6} sm={4} md={3} key={scheme}>
                <Box onClick={() => handleColorSchemeChange(scheme)} sx={{ cursor: 'pointer', p: 2, borderRadius: 2, transition: 'all 0.3s', border: colorScheme === scheme ? 2 : 1, borderColor: colorScheme === scheme ? '#1976d2' : '#e0e0e0', bgcolor: colorScheme === scheme ? alpha('#1976d2', 0.04) : 'background.paper', position: 'relative', textAlign: 'center', '&:hover': { transform: 'translateY(-4px)', boxShadow: 2 } }}>
                  <Box display="flex" justifyContent="center" gap={1.5} mb={1.5}>
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: colors.primary, boxShadow: 2 }} />
                    <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: colors.secondary, boxShadow: 2 }} />
                  </Box>
                  <Typography variant="body2" fontWeight="bold">{scheme.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                  {colorScheme === scheme && <CheckCircle sx={{ position: 'absolute', top: -8, right: -8, fontSize: 18, color: '#1976d2', bgcolor: 'background.paper', borderRadius: '50%' }} />}
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity="success" 
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ThemeSettingsPage;
