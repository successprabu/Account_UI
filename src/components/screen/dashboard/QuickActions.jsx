import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha, useTheme } from '@mui/material/styles';

/** Grid of large link cards: [{ to, label, description?, icon, color? }]. */
const QuickActions = ({ actions }) => {
  const theme = useTheme();
  return (
    <Grid container spacing={2}>
      {actions.map((a) => {
        const color = a.color || theme.palette.primary.main;
        return (
          <Grid item xs={12} sm={6} xl={3} key={a.to + a.label}>
            <Card
              component={RouterLink}
              to={a.to}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2.5,
                height: '100%',
                textDecoration: 'none',
                color: 'text.primary',
                transition: 'box-shadow .2s, transform .2s',
                '&:hover': { boxShadow: 'var(--ms-shadow-md)', transform: 'translateY(-2px)' },
              }}
            >
              <Box sx={{ width: 48, height: 48, borderRadius: 2.5, display: 'grid', placeItems: 'center', color, bgcolor: alpha(color, 0.12), flexShrink: 0, '& svg': { fontSize: 26 } }}>{a.icon}</Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={600} sx={{ lineHeight: 1.3 }}>
                  {a.label}
                </Typography>
                {a.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {a.description}
                  </Typography>
                )}
              </Box>
              <ArrowForwardIcon sx={{ color: 'text.disabled' }} />
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export const DashboardPage = ({ title, subtitle, actions, children }) => (
  <Box sx={{ py: { xs: 2.5, md: 3 } }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }}>
      <Box>
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 22, md: 26 } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
    </Stack>
    {children}
  </Box>
);

export default QuickActions;
