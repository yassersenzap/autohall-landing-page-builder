import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth-storage';
import StudioShell from './studio/StudioShell';

export default function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <StudioShell>
      <Outlet />
    </StudioShell>
  );
}
