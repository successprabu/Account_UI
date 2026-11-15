/*
 * MySuccess design tokens — the single source for colours, type, spacing,
 * corner radius and shadows. The MUI theme (./theme.js) and the CSS variables
 * used by plain CSS files (--ms-*) are both generated from these values.
 */

// Brand: indigo + violet, already used across the public site.
export const brand = {
  primary: '#6366f1', // indigo 500
  primaryDark: '#4f46e5', // indigo 600
  primaryLight: '#a5b4fc', // indigo 300
  accent: '#8b5cf6', // violet 500
  gold: '#e6b25d', // from the logo; use sparingly for highlights
  gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
};

// Status colours carry meaning; never use them for decoration.
export const status = {
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#0ea5e9',
};

// Neutral scale (slate).
export const slate = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
};

// Surface and text colours per mode.
export const surfaces = {
  light: {
    background: slate[50],
    paper: '#ffffff',
    raised: '#ffffff',
    sunken: slate[100],
    border: slate[200],
    borderStrong: slate[300],
    text: slate[900],
    textSecondary: slate[500],
    textDisabled: slate[400],
  },
  dark: {
    background: '#0b1020',
    paper: '#111827',
    raised: '#1a2234',
    sunken: '#0a0f1c',
    border: '#1f2a3d',
    borderStrong: '#2c3a52',
    text: '#e5e7eb',
    textSecondary: slate[400],
    textDisabled: slate[600],
  },
};

// Fonts: Inter for Latin; Noto Sans covers Tamil, Hindi, Telugu, Kannada, Malayalam.
export const fontFamily = [
  'Inter',
  '"Noto Sans Tamil"',
  '"Noto Sans Devanagari"',
  '"Noto Sans Telugu"',
  '"Noto Sans Kannada"',
  '"Noto Sans Malayalam"',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  'sans-serif',
].join(',');

// Type scale (px). Line heights are generous so Indic scripts don't clip.
export const type = {
  display: { size: 40, weight: 700, lineHeight: 1.2 },
  h1: { size: 32, weight: 700, lineHeight: 1.25 },
  h2: { size: 26, weight: 600, lineHeight: 1.3 },
  h3: { size: 21, weight: 600, lineHeight: 1.35 },
  h4: { size: 18, weight: 600, lineHeight: 1.4 },
  body: { size: 15, weight: 400, lineHeight: 1.6 },
  bodySmall: { size: 13, weight: 400, lineHeight: 1.55 },
  label: { size: 13, weight: 500, lineHeight: 1.4 },
  caption: { size: 12, weight: 400, lineHeight: 1.45 },
};

// 8-point spacing; MUI's theme.spacing(n) = n * 8px.
export const spacingUnit = 8;

export const radius = {
  sm: 6,
  md: 10, // inputs, buttons
  lg: 14, // cards, dialogs
  xl: 20, // hero panels
  pill: 999,
};

export const shadows = {
  light: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.06)',
    md: '0 4px 12px rgba(15, 23, 42, 0.08)',
    lg: '0 12px 32px rgba(15, 23, 42, 0.12)',
  },
  dark: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 4px 12px rgba(0, 0, 0, 0.45)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.55)',
  },
};

export const breakpoints = { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 };
