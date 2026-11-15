import React from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';

/** A page section with an optional eyebrow, title and intro, centred or left-aligned. */
export const Section = ({ id, eyebrow, title, intro, align = 'center', tinted = false, children, sx }) => (
  <Box component="section" id={id} sx={{ py: { xs: 7, md: 10 }, bgcolor: tinted ? 'background.paper' : 'transparent', borderBlock: tinted ? 1 : 0, borderColor: 'divider', ...sx }}>
    <Container maxWidth="lg">
      {(eyebrow || title || intro) && (
        <Stack spacing={1.5} sx={{ mb: { xs: 4, md: 6 }, textAlign: align, alignItems: align === 'center' ? 'center' : 'flex-start' }}>
          {eyebrow && (
            <Typography variant="overline" color="primary.main">
              {eyebrow}
            </Typography>
          )}
          {title && (
            <Typography variant="h2" component="h2" sx={{ maxWidth: 720 }}>
              {title}
            </Typography>
          )}
          {intro && (
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, fontSize: 17 }}>
              {intro}
            </Typography>
          )}
        </Stack>
      )}
      {children}
    </Container>
  </Box>
);

/** Closing call-to-action band used at the bottom of public pages. */
export const CtaBand = ({ title, text, actions }) => (
  <Box component="section" sx={{ py: { xs: 6, md: 8 } }}>
    <Container maxWidth="lg">
      <Box
        sx={{
          background: 'var(--ms-gradient)',
          color: '#fff',
          borderRadius: 5,
          px: { xs: 3, md: 8 },
          py: { xs: 5, md: 7 },
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h2" sx={{ color: '#fff' }}>
          {title}
        </Typography>
        {text && (
          <Typography sx={{ mt: 1.5, opacity: 0.9, fontSize: 17, maxWidth: 620, mx: 'auto' }}>
            {text}
          </Typography>
        )}
        {actions && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ mt: 4 }}>
            {actions}
          </Stack>
        )}
      </Box>
    </Container>
  </Box>
);

/** Small coloured icon tile. */
export const IconTile = ({ color, children, size = 48 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: 2.5,
      display: 'grid',
      placeItems: 'center',
      color,
      bgcolor: `${color}1a`,
      flexShrink: 0,
      '& svg': { fontSize: size * 0.52 },
    }}
  >
    {children}
  </Box>
);
