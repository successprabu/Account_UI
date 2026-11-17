import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Dialog, DialogActions, DialogContent, IconButton, Link, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { IconTile } from './Section';
import { linkProps } from './products';

/**
 * "How to get started" for a product: what to do to try it (usually register,
 * then sign in) with the right link, plus links to details and pricing.
 */
const ProductStartDialog = ({ product, onClose }) => {
  const { t } = useTranslation();
  const p = product;
  const start = p?.start;

  return (
    <Dialog open={!!start} onClose={onClose} maxWidth="xs" fullWidth aria-labelledby="product-start-title">
      {start && (
        <>
          <IconButton onClick={onClose} aria-label="Close" sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
          <DialogContent sx={{ pt: 4 }}>
            <IconTile color={p.color}>{p.icon}</IconTile>
            <Typography variant="overline" sx={{ display: 'block', mt: 2, color: p.color }}>
              {t(p.titleKey, { defaultValue: p.title })}
            </Typography>
            <Typography id="product-start-title" variant="h5" component="h2" fontWeight={700}>
              {start.title}
            </Typography>
            <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2.5 }}>
              {start.steps.map((step, i) => (
                <Stack component="li" key={step} direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.75 }}>
                  <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: p.color, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {i + 1}
                  </Box>
                  <Typography sx={{ pt: 0.25 }}>{step}</Typography>
                </Stack>
              ))}
            </Box>
            {start.note && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {start.note}{' '}
                {start.noteLink && (
                  <Link component={RouterLink} to={start.noteLink.to} onClick={onClose}>
                    {start.noteLink.label}
                  </Link>
                )}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 0, flexDirection: 'column', alignItems: 'stretch', gap: 1, '& > :not(style) ~ :not(style)': { ml: 0 } }}>
            <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} {...linkProps(start.action)} onClick={onClose}>
              {start.action.label}
            </Button>
            <Stack direction="row" justifyContent="center" flexWrap="wrap" useFlexGap columnGap={1}>
              <Button component={RouterLink} to={`/services#${p.id}`} onClick={onClose}>
                See details
              </Button>
              {p.pricing && (
                <Button {...linkProps(p.pricing)} onClick={onClose}>
                  Pricing
                </Button>
              )}
              {start.signIn && (
                <Button component={RouterLink} to="/login" onClick={onClose}>
                  Already registered? Sign in
                </Button>
              )}
            </Stack>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ProductStartDialog;
