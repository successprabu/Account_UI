import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

/** Shown when a list or table has nothing in it; says why and what to do next. */
const EmptyState = ({ icon, title, description, action, compact = false }) => {
  const theme = useTheme();
  return (
    <Stack alignItems="center" textAlign="center" spacing={1.5} sx={{ py: compact ? 4 : 7, px: 3 }}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          color: 'primary.main',
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          '& svg': { fontSize: 28 },
        }}
      >
        {icon || <InboxOutlinedIcon />}
      </Box>
      <Typography variant="h5" component="p">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
};

export default EmptyState;
