import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth-storage';

/** Routes protégées sans StudioShell — éditeur plein écran. */
export default function ProtectedFullscreenRoute() {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
