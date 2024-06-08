import React from 'react';
import AppHeader from './header';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';

const Rootlayout = () => {
  return (
    <div className="root-container">
      <SideBar />
      <div className="content-container">
        <AppHeader />
        <Outlet />
      </div>
    </div>
  );
};

export default Rootlayout;
