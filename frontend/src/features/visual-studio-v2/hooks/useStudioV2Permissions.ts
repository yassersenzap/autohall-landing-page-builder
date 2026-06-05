import { useCallback, useEffect, useState } from 'react';
import { ApiError, logoutClient, meRequest } from '@/lib/api';

function canManageStudio(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}

type UseStudioV2PermissionsInput = {
  navigateToLogin: () => void;
};

export function useStudioV2Permissions({ navigateToLogin }: UseStudioV2PermissionsInput) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await meRequest();
      setRole(profile.data.role);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutClient();
        navigateToLogin();
        return;
      }
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [navigateToLogin]);

  useEffect(() => {
    void load();
  }, [load]);

  const canWrite = loading ? true : role ? canManageStudio(role) : false;

  return { canWrite, loading, role };
}
