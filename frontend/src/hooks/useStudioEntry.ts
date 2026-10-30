import { useEffect, useState } from 'react';

import { fetchLatestStudioEntry } from '@/lib/studio-entry';
import { type StudioSession } from '@/lib/studio-session';
import { useStudioSession } from '@/hooks/useStudioSession';

export type StudioEntrySource = 'local' | 'api' | null;

export function useStudioEntry(): {
  session: StudioSession | null;
  loading: boolean;
  source: StudioEntrySource;
} {
  const localSession = useStudioSession();
  const [apiSession, setApiSession] = useState<StudioSession | null>(null);
  const [loading, setLoading] = useState(() => localSession === null);

  useEffect(() => {
    if (localSession) {
      setApiSession(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchLatestStudioEntry()
      .then((entry) => {
        if (!cancelled) setApiSession(entry);
      })
      .catch(() => {
        if (!cancelled) setApiSession(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [localSession]);

  const session = localSession ?? apiSession;
  const source: StudioEntrySource = localSession ? 'local' : apiSession ? 'api' : null;

  return { session, loading, source };
}
