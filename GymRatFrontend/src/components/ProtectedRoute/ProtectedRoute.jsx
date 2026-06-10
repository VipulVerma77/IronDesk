import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { selectToken, selectUser } from '../../features/auth/authSlice';

const ProtectedRoute = ({ allowedRole }) => {
  const token = useSelector(selectToken);
  const user  = useSelector(selectUser);

  // Not logged in → go to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → go to home
  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;