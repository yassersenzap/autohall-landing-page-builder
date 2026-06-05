import { useCallback, useEffect, useState } from 'react';
import { readStudioSession, type StudioSession } from '@/lib/studio-session';

export function useStudioSession(): StudioSession | null {
  const [session, setSession] = useState<StudioSession | null>(() => readStudioSession());

  const refresh = useCallback(() => {
    setSession(readStudioSession());
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key === 'autohall-studio-session' ||
        event.key === 'autohall-studio-last-draft'
      ) {
        refresh();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  return session;
}
