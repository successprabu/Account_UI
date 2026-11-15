import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import AppHeader from './AppHeader';

const signedIn = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem('user')));
  } catch (e) {
    return false;
  }
};

/**
 * Page title bar used by the app screens: the title on the left and quick links on the right.
 * (The language menu now lives in the top bar of the app shell.)
 * Props kept from the old header: titles (array), links ([{ to, label }]).
 */
const Header = ({ titles = [], links = [] }) => {
  const title = titles.filter(Boolean).join(' · ');
  return (
    <>
      {!signedIn() && <AppHeader />}
      <Box
        component="header"
        sx={{
          px: { xs: 2, md: 3 },
          pt: { xs: 2.5, md: 3 },
          pb: { xs: 2, md: 2.5 },
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 22, md: 26 } }}>
            {title}
          </Typography>
          {links.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {links.map((link, i) => (
                <Button
                  key={link.to + i}
                  component={RouterLink}
                  to={link.to}
                  variant="outlined"
                  color="inherit"
                  size="small"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {link.label}
                </Button>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default Header;
