import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import {
  enableGrapesjsStudio,
  fetchDesignProject,
  saveDesignProject,
} from '../api/designStudioApi';
import type { DesignProjectPayload } from '../types/design-studio.types';

export function useDesignStudioProject(pageVersionId: string) {
  const [project, setProject] = useState<DesignProjectPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDesignProject(pageVersionId);
      setProject(res.data);
      setDirty(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Impossible de charger le studio.');
    } finally {
      setLoading(false);
    }
  }, [pageVersionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const markDirty = useCallback(() => setDirty(true), []);

  const persist = useCallback(
    async (payload: {
      projectJson: Record<string, unknown>;
      htmlSnapshot: string;
      cssSnapshot: string;
    }) => {
      setSaving(true);
      try {
        const res = await saveDesignProject(pageVersionId, {
          ...payload,
          engine: 'grapesjs',
        });
        setProject(res.data);
        setDirty(false);
        return res.data;
      } finally {
        setSaving(false);
      }
    },
    [pageVersionId],
  );

  const enableStudio = useCallback(async () => {
    const res = await enableGrapesjsStudio(pageVersionId);
    setProject(res.data);
    setDirty(false);
    return res.data;
  }, [pageVersionId]);

  return {
    project,
    loading,
    error,
    dirty,
    saving,
    markDirty,
    persist,
    enableStudio,
    reload: load,
  };
}
