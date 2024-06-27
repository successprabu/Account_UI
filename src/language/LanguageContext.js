import React, { createContext, useState, useContext } from "react";
import i18n from "./i18n"; // assuming you have i18n setup

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // default language

  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang); // assuming i18n supports language change
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
