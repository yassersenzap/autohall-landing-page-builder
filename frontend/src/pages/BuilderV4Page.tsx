import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { V4Workspace } from '@/features/builder-v4/layout/V4Workspace';
import { BuilderErrorBoundary } from '@/features/builder-v4/layout/BuilderErrorBoundary';
import { useBuilderV4Store } from '@/features/builder-v4/store/document.store';
import { fetchPageVersionById } from '@/lib/page-versions';

export default function BuilderV4Page() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const loadDocument = useBuilderV4Store((s) => s.loadDocument);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pageVersionId) {
      // Mode sandbox / standalone sans session — ouvre un canvas vide
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function init() {
      try {
        setLoading(true);
        setError(null);
        const versionRes = await fetchPageVersionById(pageVersionId!);
        if (cancelled) return;
        const { landingPageId, campaignId, campaignName, campaignBrand, campaignModel } = versionRes.data;
        await loadDocument(landingPageId, pageVersionId!, {
          campaignId,
          campaignName,
          campaignBrand,
          campaignModel,
        });
        if (cancelled) return;
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('[BuilderV4Page] Erreur de chargement:', err);
        const message =
          err instanceof Error ? err.message : 'Impossible de charger la version de la page.';
        setError(message);
        setLoading(false);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [pageVersionId, loadDocument]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-400">
        Chargement de l&apos;éditeur…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-center">
        <p className="text-sm font-semibold text-red-400">Échec du chargement du Studio</p>
        <p className="max-w-md text-xs text-zinc-500">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 rounded-lg bg-red-800 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <BuilderErrorBoundary>
      <V4Workspace />
    </BuilderErrorBoundary>
  );
}
