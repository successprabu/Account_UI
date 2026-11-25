import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ta from './site/ta.json';
import hi from './site/hi.json';
import te from './site/te.json';
import kn from './site/kn.json';
import ml from './site/ml.json';

/**
 * Text for the public website (home, products, pricing, mahal booking, registration, chat…).
 * Write the English sentence in the code: tx('Simple pricing'). The files in ./site/ map each English sentence to
 * its translation; anything not translated yet simply shows in English. {{name}} placeholders work as in i18next.
 * Add new sentences to every file in ./site/ (the test "site translations" lists any that are missing).
 */
export const SITE_TEXT = { ta, hi, te, kn, ml };

const fill = (s, vars) => (vars ? s.replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (vars[k] ?? m)) : s);

/** Translate one English sentence into a language (outside React). */
export const siteText = (lang, text, vars) => {
  const core = text.trim();
  const hit = SITE_TEXT[lang]?.[core];
  return fill(hit ? text.replace(core, hit) : text, vars);
};

/** Hook: const tx = useTx(); tx('Pricing'). Re-renders when the language changes. */
export const useTx = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2);
  return useCallback((text, vars) => (text == null ? text : siteText(lang, String(text), vars)), [lang]);
};
