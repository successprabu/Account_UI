import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppShell from './AppShell';
import PageLoader from './PageLoader';
import PublicFooter from '../public/PublicFooter';

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
};

const Rootlayout = () => {
  const user = readUser();
  if (user) {
    return (
      <AppShell>
        <Suspense fallback={<PageLoader inline />}>
          <Outlet />
        </Suspense>
      </AppShell>
    );
  }
  return (
    <div>
      <AppHeader />
      <Suspense fallback={<PageLoader inline />}>
        <Outlet />
      </Suspense>
      <PublicFooter />
    </div>
  );
};

export default Rootlayout;
