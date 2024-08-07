import React, { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

const darkTheme = {
  sidebarBackground: '#1a1a1a',
  sidebarLinkColor: '#d3d3d3',
  sidebarLogoColor: '#ffffff',
};

const lightTheme = {
  sidebarBackground: '#ffffff',
  sidebarLinkColor: '#333',
  sidebarLogoColor: '#333',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(lightTheme); // Default theme

  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
