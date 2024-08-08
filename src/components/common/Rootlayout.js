import React, { useState, useEffect } from 'react';
import AppHeader from './AppHeader';
import { Outlet } from 'react-router-dom';
import SideBar from './SideBar';
import './css/Rootlayout.css'; // Import the CSS file

const Rootlayout = () => {

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    console.log(user,"userfromroot")
  }, []);
  return (
    <div>
      {user ? (
        <div className="content-container">
          <SideBar />
          <div className='outlet'> <Outlet /></div>
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
