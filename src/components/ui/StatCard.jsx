import { Box, Card, Skeleton, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * A headline number with a label, e.g. "Total income ₹1,24,500".
 * color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
 * trend: { value: '12%', direction: 'up' | 'down', label?: 'vs last month' }
 */
const StatCard = ({ label, value, icon, color = 'primary', trend, loading = false }) => {
  const theme = useTheme();
  const main = theme.palette[color]?.main || theme.palette.primary.main;
  const up = trend?.direction !== 'down';
  return (
    <Card sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        {icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              color: main,
              bgcolor: alpha(main, theme.palette.mode === 'dark' ? 0.18 : 0.1),
              flexShrink: 0,
              '& svg': { fontSize: 24 },
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap title={typeof label === 'string' ? label : undefined}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width="60%" height={36} />
          ) : (
            <Typography variant="h3" component="p" sx={{ mt: 0.5, fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </Typography>
          )}
          {trend && !loading && (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
              {up ? <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} /> : <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />}
              <Typography variant="caption" fontWeight={600} color={up ? 'success.main' : 'error.main'}>
                {trend.value}
              </Typography>
              {trend.label && (
                <Typography variant="caption" color="text.secondary">
                  {trend.label}
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
    </Card>
  );
};

export default StatCard;
