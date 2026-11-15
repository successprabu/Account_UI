import { createTheme, alpha } from '@mui/material/styles';
import { brand, status, surfaces, fontFamily, type, spacingUnit, radius, shadows, breakpoints } from './tokens';

const px = (n) => `${n / 16}rem`;
const typeStyle = (t) => ({ fontSize: px(t.size), fontWeight: t.weight, lineHeight: t.lineHeight });

/**
 * Build the app's MUI theme.
 * @param {'light'|'dark'} mode
 * @param {{primary: string, secondary?: string}} palette  primary/secondary from the chosen colour scheme
 */
export function createAppTheme(mode = 'light', palette = {}) {
  const s = surfaces[mode] || surfaces.light;
  const sh = shadows[mode] || shadows.light;
  const primary = palette.primary || brand.primary;
  const secondary = palette.secondary || brand.accent;

  return createTheme({
    breakpoints: { values: breakpoints },
    spacing: spacingUnit,
    shape: { borderRadius: radius.md },
    palette: {
      mode,
      primary: { main: primary },
      secondary: { main: secondary },
      success: { main: status.success },
      warning: { main: status.warning },
      error: { main: status.error },
      info: { main: status.info },
      background: { default: s.background, paper: s.paper },
      text: { primary: s.text, secondary: s.textSecondary, disabled: s.textDisabled },
      divider: s.border,
    },
    typography: {
      fontFamily,
      h1: typeStyle(type.display),
      h2: typeStyle(type.h1),
      h3: typeStyle(type.h2),
      h4: typeStyle(type.h3),
      h5: typeStyle(type.h4),
      h6: { ...typeStyle(type.h4), fontSize: px(16) },
      subtitle1: { ...typeStyle(type.body), fontWeight: 500 },
      subtitle2: typeStyle(type.label),
      body1: typeStyle(type.body),
      body2: typeStyle(type.bodySmall),
      caption: typeStyle(type.caption),
      overline: { ...typeStyle(type.caption), fontWeight: 600, letterSpacing: '0.08em' },
      button: { ...typeStyle(type.label), fontSize: px(14), fontWeight: 600, textTransform: 'none' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: s.background, WebkitFontSmoothing: 'antialiased' },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: radius.md, paddingInline: 18, minHeight: 40 },
          sizeSmall: { minHeight: 32, paddingInline: 12 },
          sizeLarge: { minHeight: 48, paddingInline: 24, fontSize: px(15) },
          outlined: { borderColor: s.borderStrong },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: radius.md } } },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: s.border },
        },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: { borderRadius: radius.lg, borderColor: s.border, boxShadow: sh.sm },
        },
      },
      MuiCardContent: { styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } } },
      MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
      MuiFormControl: { defaultProps: { size: 'small' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            backgroundColor: s.paper,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: s.borderStrong },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: s.textSecondary },
          },
          input: { paddingBlock: 10 },
        },
      },
      MuiInputLabel: { styleOverrides: { root: { fontWeight: 500 } } },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: radius.pill, fontWeight: 500 },
        },
      },
      MuiTableContainer: {
        styleOverrides: { root: { borderRadius: radius.lg, border: `1px solid ${s.border}` } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: s.border, paddingBlock: 12 },
          head: {
            fontWeight: 600,
            fontSize: px(13),
            color: s.textSecondary,
            backgroundColor: s.sunken,
            whiteSpace: 'nowrap',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: { '&.MuiTableRow-hover:hover': { backgroundColor: alpha(primary, mode === 'dark' ? 0.08 : 0.04) } },
        },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: radius.lg, boxShadow: sh.lg } },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontWeight: 600, fontSize: px(18) } } },
      MuiAlert: { styleOverrides: { root: { borderRadius: radius.md } } },
      MuiTooltip: {
        styleOverrides: { tooltip: { borderRadius: radius.sm, fontSize: px(12), backgroundColor: mode === 'dark' ? '#334155' : '#0f172a' } },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'inherit' },
        styleOverrides: { root: { borderBottom: `1px solid ${s.border}`, backgroundColor: s.paper } },
      },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
      MuiLinearProgress: { styleOverrides: { root: { borderRadius: radius.pill } } },
    },
  });
}

/** CSS variables for plain CSS files, so non-MUI styles follow the same theme. */
export function cssVariables(mode = 'light', palette = {}) {
  const s = surfaces[mode] || surfaces.light;
  const sh = shadows[mode] || shadows.light;
  const primary = palette.primary || brand.primary;
  const secondary = palette.secondary || brand.accent;
  return {
    '--ms-primary': primary,
    '--ms-secondary': secondary,
    '--ms-gradient': `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    '--ms-success': status.success,
    '--ms-warning': status.warning,
    '--ms-error': status.error,
    '--ms-info': status.info,
    '--ms-bg': s.background,
    '--ms-paper': s.paper,
    '--ms-sunken': s.sunken,
    '--ms-border': s.border,
    '--ms-text': s.text,
    '--ms-text-secondary': s.textSecondary,
    '--ms-radius-md': `${radius.md}px`,
    '--ms-radius-lg': `${radius.lg}px`,
    '--ms-shadow-sm': sh.sm,
    '--ms-shadow-md': sh.md,
    '--ms-shadow-lg': sh.lg,
    '--ms-font': fontFamily,
  };
}
