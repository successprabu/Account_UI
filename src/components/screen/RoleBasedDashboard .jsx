import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import DashboardUser from './DashboardUser';
import DashboardAdmin from './DashboardAdmin';
import ProtectedRoute from '../common/ProtectedRoute';


const RoleBasedDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  switch (user.userType) {
    case 'SU':
      return (
        <ProtectedRoute allowedRoles={['SU']}>
        <Dashboard/>
        </ProtectedRoute>
      );
    case 'AU':
      return (
        <ProtectedRoute allowedRoles={['AU']}>
          <DashboardAdmin/>
        </ProtectedRoute>
      );
    case 'NU':
      return (
        <ProtectedRoute allowedRoles={['NU']}>
          <DashboardUser/>
        </ProtectedRoute>
      );
    default:
      navigate('/unauthorized');
      return null;
  }
};

export default RoleBasedDashboard;
