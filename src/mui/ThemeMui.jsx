import { useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme as useAppTheme } from '../ThemeProvider';
import { colorPalettes, DEFAULT_COLOR_SCHEME } from '../theme/themeConfig';
import { createAppTheme, cssVariables } from '../design/theme';
import { surfaces } from '../design/tokens';

export const ThemeMui = ({ children }) => {
  const appTheme = useAppTheme();
  const mode = appTheme?.mode || 'light';
  const colorScheme = appTheme?.colorScheme || DEFAULT_COLOR_SCHEME;
  const paletteColors = colorPalettes[colorScheme] || colorPalettes[DEFAULT_COLOR_SCHEME];

  const theme = useMemo(() => createAppTheme(mode, paletteColors), [mode, paletteColors]);

  // CSS variables so plain CSS (sidebar, legacy pages) follows the same theme.
  useEffect(() => {
    try {
      const root = document.documentElement;
      Object.entries(cssVariables(mode, paletteColors)).forEach(([k, v]) => root.style.setProperty(k, v));
      root.dataset.theme = mode;
      root.setAttribute('data-bs-theme', mode); // Bootstrap's own dark mode for older screens
      // Legacy variables kept for existing CSS files
      root.style.setProperty('--primary-main', paletteColors.primary);
      root.style.setProperty('--secondary-main', paletteColors.secondary);
      root.style.setProperty('--sidebar-bg', paletteColors.primary);
      root.style.setProperty('--sidebar-hover', paletteColors.secondary);
      root.style.setProperty('--sidebar-text', '#ffffff');
      root.style.setProperty('--app-bg', (surfaces[mode] || surfaces.light).background);
      root.style.setProperty('--sidebar-border', paletteColors.secondary);
    } catch (e) {
      // no DOM
    }
  }, [mode, paletteColors]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeMui;
