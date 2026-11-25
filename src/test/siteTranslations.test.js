/** site translations: every sentence passed to tx('…') in the code has a translation in every language file. */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { describe, expect, it } from 'vitest';
import { SITE_TEXT, siteText } from '../language/site';

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) return f === 'test' ? [] : walk(p);
    return /\.jsx?$/.test(f) ? [p] : [];
  });

const literals = () => {
  const out = new Set();
  const re = /\btx\(\s*(['"])((?:\\.|(?!\1).)*?)\1/g;
  for (const file of walk(join(__dirname, '..'))) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(re)) out.add(m[2].replace(/\\(['"])/g, '$1').trim());
  }
  return [...out].filter(Boolean);
};

describe('site translations', () => {
  const used = literals();
  for (const [lang, dict] of Object.entries(SITE_TEXT)) {
    it(`${lang} has every tx() sentence`, () => {
      expect(used.filter((s) => !(s in dict))).toEqual([]);
    });
  }
  it('keeps placeholders and surrounding spaces', () => {
    expect(siteText('en', 'Save ₹{{amount}} a year', { amount: '9,989' })).toBe('Save ₹9,989 a year');
    expect(siteText('ta', ' Pricing ')).toBe(' விலை ');
    expect(siteText('ta', 'Not in the dictionary')).toBe('Not in the dictionary');
  });
});
