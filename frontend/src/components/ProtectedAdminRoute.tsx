import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../lib/auth-storage';
import { meRequest, type AuthUser } from '../lib/api';
import { hasPermission, Permission } from '../lib/permissions';
import StudioShell from './studio/StudioShell';

/** Routes protégées accessibles uniquement aux administrateurs (MANAGE_USERS). */
export default function ProtectedAdminRoute() {
  const location = useLocation();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);

  useEffect(() => {
    if (!isAuthenticated()) {
      setUser(null);
      return;
    }
    void meRequest()
      .then((r) => setUser(r.data))
      .catch(() => setUser(null));
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user === undefined) {
    return null;
  }

  if (!hasPermission(user, Permission.MANAGE_USERS)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <StudioShell>
      <Outlet />
    </StudioShell>
  );
}
