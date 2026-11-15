import React from 'react';
import { Box, Card, CardContent, Divider, Stack, Typography } from '@mui/material';

/** A titled card that groups related content (a form section, a chart, a table). */
const SectionCard = ({ title, subtitle, actions, children, noPadding = false, sx }) => (
  <Card sx={sx}>
    {(title || actions) && (
      <>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ px: 2.5, py: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography variant="h5" component="h2">
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
        </Stack>
        <Divider />
      </>
    )}
    {noPadding ? children : <CardContent>{children}</CardContent>}
  </Card>
);

export default SectionCard;
