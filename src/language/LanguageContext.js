import React, { createContext, useState, useContext, useEffect } from "react";
import i18n from "./i18n"; // assuming you have i18n setup

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get the language from localStorage if available, otherwise default to "en"
    return localStorage.getItem("appLanguage") || "en";
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang); // assuming i18n supports language change
    localStorage.setItem("appLanguage", lang); // Save the selected language to localStorage
  };

  // Apply the language on initial render
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
