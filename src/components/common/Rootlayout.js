import React, { useState, useEffect } from 'react';
import AppHeader from './AppHeader';
import { Outlet, useNavigate } from 'react-router-dom';
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
            <Outlet />
          </div>
        </div>
      ) : (
        <div>
          <AppHeader />
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default Rootlayout;
