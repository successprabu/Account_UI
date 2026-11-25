import { Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import DashboardUser from './DashboardUser';
import DashboardAdmin from './DashboardAdmin';
import ProtectedRoute from '../common/ProtectedRoute';
import DashboardMahal from './DashboardMahal';
import PlanReminder from '../billing/PlanReminder';

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
          <PlanReminder userType="AU" />
          <DashboardAdmin />
        </ProtectedRoute>
      );
    case 'NU':
      return (
        <ProtectedRoute allowedRoles={['NU']}>
          <DashboardUser />
        </ProtectedRoute>
      );
      case 'MU':
      case 'MS':
        return (
          <ProtectedRoute allowedRoles={['MU', 'MS']}>
            {user.userType === 'MU' && <PlanReminder userType="MU" />}
            <DashboardMahal />
          </ProtectedRoute>
          
        );
    default:
      // Redirect to unauthorized page if user type is not recognized
      return <Navigate to="/unauthorized" />;
  }
};

export default RoleBasedDashboard;
