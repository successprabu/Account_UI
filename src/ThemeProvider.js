import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

const ThemeContext = createContext();

const defaultState = {
  mode: 'light', // 'light' | 'dark'
  colorScheme: 'dentalBlue',
  sidebarPosition: 'left', // 'left' | 'right' | 'top'
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(defaultState.mode);
  const [colorScheme, setColorScheme] = useState(defaultState.colorScheme);
  const [sidebarPosition, setSidebarPosition] = useState(defaultState.sidebarPosition);

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
