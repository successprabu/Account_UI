import { Box, Breadcrumbs, Link, Stack, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Top of every app page: breadcrumb, title, optional subtitle and actions on the right.
 * breadcrumbs: [{ label, to? }]  — the last item is the current page.
 */
const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => (
  <Box component="header" sx={{ mb: 3 }}>
    {breadcrumbs.length > 0 && (
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1, fontSize: 13 }} aria-label="breadcrumb">
        {breadcrumbs.map((b, i) =>
          b.to && i < breadcrumbs.length - 1 ? (
            <Link key={b.label} component={RouterLink} to={b.to} underline="hover" color="text.secondary">
              {b.label}
            </Link>
          ) : (
            <Typography key={b.label} color="text.primary" fontSize={13} fontWeight={500}>
              {b.label}
            </Typography>
          )
        )}
      </Breadcrumbs>
    )}
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h3" component="h1">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ flexShrink: 0, '& .MuiButton-root': { whiteSpace: 'nowrap' } }}>
          {actions}
        </Stack>
      )}
    </Stack>
  </Box>
);

export default PageHeader;
