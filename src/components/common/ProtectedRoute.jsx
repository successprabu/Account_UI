import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { currentUser } from '../../utils/session';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = currentUser();
  let stored = null;
  try {
    stored = localStorage.getItem('user');
  } catch (e) {
    stored = null;
  }
  const expired = !user && !!stored;

  // Remove an expired login after drawing (not while drawing: React may draw twice and must decide the same).
  useEffect(() => {
    if (expired) {
      try {
        localStorage.removeItem('user');
      } catch (e) {
        // storage blocked: nothing to remove
      }
    }
  }, [expired]);

  if (!user) {
    // The login page says the session ended when there was a login and it has expired.
    return <Navigate to={expired ? '/login?session=expired' : '/login'} replace />;
  }

  if (!allowedRoles.includes(user.userType)) {
    console.log('User role not allowed, redirecting to unauthorized.');
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
