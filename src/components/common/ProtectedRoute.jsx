import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));


  if (!user) {
    console.log('User not found, redirecting to login.');
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.userType)) {
    console.log('User role not allowed, redirecting to unauthorized.');
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
