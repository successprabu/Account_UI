import React from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme as useAppTheme } from '../ThemeProvider';
import { colorPalettes } from '../theme/themeConfig';
import { useEffect } from 'react';

export const ThemeMui = ({ children }) => {
  const appTheme = useAppTheme();
  const mode = appTheme?.mode || 'light';
  const colorScheme = appTheme?.colorScheme || 'dentalBlue';

  const paletteColors = colorPalettes[colorScheme] || { primary: '#1976d2', secondary: '#f59e0b' };

  const theme = createTheme({
    palette: {
      mode,
      primary: { main: paletteColors.primary },
      secondary: { main: paletteColors.secondary },
    },
    typography: {
      fontFamily: ['Roboto', 'Noto Sans Tamil', 'Helvetica', 'Arial', 'sans-serif'].join(',')
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true
        }
      }
    }
  });

  // Apply CSS variables so non-MUI parts (sidebar CSS etc.) can pick up colors
  useEffect(() => {
    try {
      const root = document.documentElement;
      root.style.setProperty('--primary-main', paletteColors.primary);
      root.style.setProperty('--secondary-main', paletteColors.secondary);
      // Sidebar-specific vars
      root.style.setProperty('--sidebar-bg', paletteColors.primary);
      root.style.setProperty('--sidebar-hover', paletteColors.secondary);
      // Choose text color based on mode
      root.style.setProperty('--sidebar-text', mode === 'dark' ? '#ffffff' : '#ffffff');
      root.style.setProperty('--app-bg', mode === 'dark' ? '#071022' : '#fafbfe');
      // Border / highlight
      root.style.setProperty('--sidebar-border', paletteColors.secondary);
    } catch (e) {
      // ignore in SSR/no DOM
    }
  }, [mode, colorScheme]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeMui;
