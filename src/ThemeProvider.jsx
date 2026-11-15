import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { colorPalettes, DEFAULT_COLOR_SCHEME } from './theme/themeConfig';

const STORAGE_KEY = 'ms-theme';

// Theme choice is remembered per browser; storage can be unavailable, so every access is guarded.
const loadSaved = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' ? saved : {};
  } catch (e) {
    return {};
  }
};

const ThemeContext = createContext();

const defaultState = {
  mode: 'light', // 'light' | 'dark'
  colorScheme: DEFAULT_COLOR_SCHEME,
  sidebarPosition: 'left', // 'left' | 'right' | 'top'
};

export const ThemeProvider = ({ children }) => {
  const saved = useMemo(loadSaved, []);
  const [mode, setMode] = useState(saved.mode === 'dark' ? 'dark' : defaultState.mode);
  const [colorScheme, setColorScheme] = useState(
    colorPalettes[saved.colorScheme] ? saved.colorScheme : defaultState.colorScheme
  );
  const [sidebarPosition, setSidebarPosition] = useState(
    ['left', 'right', 'top'].includes(saved.sidebarPosition) ? saved.sidebarPosition : defaultState.sidebarPosition
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ mode, colorScheme, sidebarPosition }));
    } catch (e) {
      // storage unavailable (private mode etc.): theme still works for this visit
    }
  }, [mode, colorScheme, sidebarPosition]);

  const toggleTheme = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  const value = useMemo(() => ({
    mode,
    colorScheme,
    sidebarPosition,
    toggleTheme,
    setColorScheme,
    setSidebarPosition,
  }), [mode, colorScheme, sidebarPosition]);
  useEffect(() => {
    try {
      window.__THEME_PROVIDER = value;
    } catch (e) {
      // ignore in non-browser env
    }
    return () => {
      try {
        if (window.__THEME_PROVIDER === value) delete window.__THEME_PROVIDER;
      } catch (e) {}
    };
  }, [value]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
