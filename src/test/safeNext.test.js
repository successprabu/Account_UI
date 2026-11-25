import { describe, expect, it } from 'vitest';
import { safeNext } from '../components/screen/login/safeNext';

describe('safeNext', () => {
  it('returns to a page on this site', () => {
    expect(safeNext('/pricing?product=moitech&plan=standard')).toBe('/pricing?product=moitech&plan=standard');
  });
  it('falls back to the dashboard for missing or outside links', () => {
    expect(safeNext(null)).toBe('/dashboard');
    expect(safeNext('https://evil.example')).toBe('/dashboard');
    expect(safeNext('//evil.example')).toBe('/dashboard');
    expect(safeNext('/\\evil.example')).toBe('/dashboard');
  });
});
