import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './json/en.json';
import ta from './json/ta.json';

const resources = {
  en: {
    translation: en
  },
  ta: {
    translation: ta
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
