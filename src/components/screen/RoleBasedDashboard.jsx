import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import DashboardUser from './DashboardUser';
import DashboardAdmin from './DashboardAdmin';
import ProtectedRoute from '../common/ProtectedRoute';

const RoleBasedDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" />;
  }

  switch (user.userType) {
    case 'SU':
      return (
        <ProtectedRoute allowedRoles={['SU']}>
          <Dashboard />
        </ProtectedRoute>
      );
    case 'AU':
      return (
        <ProtectedRoute allowedRoles={['AU']}>
          <DashboardAdmin />
        </ProtectedRoute>
      );
    case 'NU':
      return (
        <ProtectedRoute allowedRoles={['NU']}>
          <DashboardUser />
        </ProtectedRoute>
      );
    default:
      // Redirect to unauthorized page if user type is not recognized
      return <Navigate to="/unauthorized" />;
  }
};

export default RoleBasedDashboard;
