import React from 'react';
import { Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * A small coloured label for a record's state ("Paid", "Pending", "Cancelled").
 * tone: 'success' | 'warning' | 'error' | 'info' | 'neutral'
 */
const StatusChip = ({ label, tone = 'neutral', size = 'small' }) => {
  const theme = useTheme();
  const main = tone === 'neutral' ? theme.palette.text.secondary : theme.palette[tone]?.main;
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        color: main,
        bgcolor: alpha(main, theme.palette.mode === 'dark' ? 0.2 : 0.1),
        border: `1px solid ${alpha(main, 0.25)}`,
        height: size === 'small' ? 24 : 30,
      }}
    />
  );
};

export default StatusChip;
