import React, { Suspense } from 'react';
import AppHeader from './AppHeader';
import { Outlet } from 'react-router-dom';
import PageLoader from './PageLoader';
import SideBar from './SideBar';
import './css/Rootlayout.css'; // Import the CSS file

const Rootlayout = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return (
    <div>
      {user ? (
        <div className="content-container">
          <SideBar />
          <div className="outlet">
            <Suspense fallback={<PageLoader inline />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      ) : (
        <div>
          <AppHeader />
          <Suspense fallback={<PageLoader inline />}>
            <Outlet />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default Rootlayout;
