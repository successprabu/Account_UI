import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './json/en.json';
import ta from './json/ta.json';
import ml from './json/ml.json';
import te from './json/te.json';
import kn from './json/kn.json';
import hi from './json/hi.json';
import { siteText } from './site';

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
    // No language fallback: a key missing in Tamil/Hindi/… goes to parseMissingKeyHandler, which takes the English
    // text (en.json or the defaultValue) and translates it with the site dictionary (./site/*.json).
    fallbackLng: false,
    parseMissingKeyHandler: (key, defaultValue) => {
      const english = defaultValue ?? en[key] ?? key;
      return siteText((i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2), String(english));
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
