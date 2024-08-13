import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './json/en.json';
import ta from './json/ta.json';
import ml from './json/ml.json';
import te from './json/te.json';
import kn from './json/kn.json';
import hi from './json/hi.json';

const resources = {
  en: {
    translation: en
  },
  ta: {
    translation: ta
  },
  ml: {
    translation: ml
  },
  kn: {
    translation: kn
  },
  te: {
    translation: te
  },
  hi: {
    translation: hi
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
