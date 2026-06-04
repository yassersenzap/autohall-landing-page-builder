import { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { fetchDesignProject, enableGrapesjsStudio } from '@/features/design-studio/api/designStudioApi';
import { DesignStudioPage } from '@/features/design-studio/components/DesignStudioPage';
import PageVersionBlocksPage from './PageVersionBlocksPage';

type LocationState = {
  versionNumber?: number;
  versionLabel?: string | null;
  versionStatus?: string;
  landingPageId?: string;
  landingPageTitle?: string;
  campaignId?: string;
  campaignName?: string;
};

/**
 * Route officielle /page-versions/:id/blocks — moteur blocs ou Visual Design Studio (GrapesJS).
 */
export default function PageVersionEditorRouter() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const [searchParams, setSearchParams] = useSearchParams();
  const forceStudio = searchParams.get('studio') === 'grapesjs';

  const [engine, setEngine] = useState<'blocks' | 'grapesjs' | null>(null);
  const [loading, setLoading] = useState(true);

  const id = pageVersionId ?? '';

  const loadEngine = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchDesignProject(id);
      setEngine(forceStudio ? 'grapesjs' : res.data.engine);
    } catch {
      setEngine('blocks');
    } finally {
      setLoading(false);
    }
  }, [forceStudio, id]);

  useEffect(() => {
    void loadEngine();
  }, [loadEngine]);

  const handleEnableStudio = useCallback(async () => {
    if (!id) return;
    await enableGrapesjsStudio(id);
    setSearchParams({ studio: 'grapesjs' });
    setEngine('grapesjs');
  }, [id, setSearchParams]);

  if (!id) {
    return <p className="p-8 text-sm text-muted-foreground">Identifiant de version manquant.</p>;
  }

  if (loading) {
    return (
      <p className="flex h-[100dvh] items-center justify-center text-sm text-muted-foreground">
        Chargement de l’éditeur…
      </p>
    );
  }

  if (engine === 'grapesjs') {
    return (
      <DesignStudioPage
        pageVersionId={id}
        campaignName={state.campaignName}
        landingTitle={state.landingPageTitle}
        versionLabel={
          state.versionLabel ?? (state.versionNumber ? `v${state.versionNumber}` : undefined)
        }
        versionStatus={state.versionStatus}
        previewTo={`/page-versions/${id}/preview`}
        backTo={{
          to: state.landingPageId
            ? `/landing-pages/${state.landingPageId}/versions`
            : '/campaigns',
          label: 'Versions',
          state,
        }}
        canWrite
        onSwitchToBlocks={() => {
          setSearchParams({});
          setEngine('blocks');
        }}
      />
    );
  }

  return (
    <>
      <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm">
        <span>
          Passez au{' '}
          <button type="button" className="font-semibold underline" onClick={() => void handleEnableStudio()}>
            Visual Design Studio
          </button>{' '}
          pour l’édition visuelle complète (drag-and-drop, styles, calques).
        </span>
      </div>
      <PageVersionBlocksPage />
    </>
  );
}
