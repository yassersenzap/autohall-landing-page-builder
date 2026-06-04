import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { getAccessToken } from '@/lib/auth-storage';
import {
  listPageVersionAssets,
  uploadPageVersionAsset,
  type PageAsset,
} from '@/lib/page-assets-api';

function formatAssetsError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Session expirée. Reconnectez-vous pour accéder aux médias.';
    }
    if (err.status === 403) {
      return 'Vous n’avez pas les droits pour gérer les médias de cette page.';
    }
    if (err.status === 404) {
      return 'Service médias introuvable. Vérifiez que le backend est à jour.';
    }
    return err.message;
  }

  if (err instanceof TypeError && /fetch|network/i.test(String(err.message))) {
    return 'Serveur inaccessible. Démarrez le backend (port 3000) et vérifiez VITE_API_BASE_URL.';
  }

  return 'Impossible de charger les médias. Réessayez ou contactez le support SI.';
}

export function usePageAssets(pageVersionId: string | null) {
  const [assets, setAssets] = useState<PageAsset[]>([]);
  const [loading, setLoading] = useState(Boolean(pageVersionId));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!pageVersionId) {
      setLoading(false);
      setAssets([]);
      return;
    }

    if (!getAccessToken()) {
      setError('Session non authentifiée. Reconnectez-vous.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listPageVersionAssets(pageVersionId);
      setAssets(data);
    } catch (err) {
      setError(formatAssetsError(err));
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [pageVersionId]);

  useEffect(() => {
    void load();
  }, [load]);

  const upload = useCallback(
    async (file: File) => {
      if (!pageVersionId) return null;
      setUploading(true);
      setError(null);
      try {
        const asset = await uploadPageVersionAsset(pageVersionId, file);
        setAssets((prev) => [asset, ...prev]);
        return asset;
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : 'Échec du téléversement.',
        );
        return null;
      } finally {
        setUploading(false);
      }
    },
    [pageVersionId],
  );

  return {
    assets,
    loading,
    uploading,
    error,
    reload: load,
    upload,
    setAssets,
  };
}
