import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StudioLayout } from '@/features/builder-v3/layout/StudioLayout';
import { StudioTopBar, type StudioV3SaveStatus } from '@/features/builder-v3/layout/StudioTopBar';
import { PageSettingsSheet } from '@/features/builder-v3/panels/PageSettingsSheet';
import { warmIframeStyleAssets } from '@/features/builder-v3/canvas/inject-iframe-styles';
import { exportBuilderV3Zip } from '@/features/builder-v3/lib/export-builder-v3';
import { saveBuilderDocumentDesign, BuilderSaveError } from '@/features/builder-v3/lib/save-builder-v3';
import { BlobUrlValidationError } from '@/features/builder-v3/lib/export-builder-v3';
import { buildPreviewNavigationState } from '@/features/builder-v3/lib/preview-navigation-state';
import { StudioToast } from '@/components/ui/StudioToast';
import { useStudioToast } from '@/components/ui/use-studio-toast';
import {
  hydrateBuilderDocumentStore,
  useBuilderDocumentStore,
} from '@/features/builder-engine/store/builder-document.store';
import { getPreviewRoute } from '@/lib/landing-studio-routes';

export default function BuilderV3Page() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const navigate = useNavigate();
  const { toast, showSuccess, showError, dismiss } = useStudioToast();
  const [saveStatus, setSaveStatus] = useState<StudioV3SaveStatus>('loading');
  const [documentHydrated, setDocumentHydrated] = useState(false);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const skipDirtyRef = useRef(true);

  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);
  const setDeviceMode = useBuilderDocumentStore((s) => s.setDeviceMode);

  useEffect(() => {
    if (!pageVersionId) return;

    let cancelled = false;
    skipDirtyRef.current = true;
    setDocumentHydrated(false);
    setSaveStatus('loading');

    void warmIframeStyleAssets();
    void hydrateBuilderDocumentStore(pageVersionId).then(() => {
      if (cancelled) return;
      setDocumentHydrated(true);
      setSaveStatus('saved');
      window.setTimeout(() => {
        skipDirtyRef.current = false;
      }, 0);
    });

    return () => {
      cancelled = true;
    };
  }, [pageVersionId]);

  useEffect(() => {
    if (!documentHydrated) return;

    const unsub = useBuilderDocumentStore.subscribe((state, prev) => {
      if (skipDirtyRef.current) return;
      if (
        state.blocks !== prev.blocks ||
        state.pageTheme !== prev.pageTheme ||
        state.pageSettings !== prev.pageSettings ||
        state.themeDirty !== prev.themeDirty
      ) {
        setSaveStatus('dirty');
      }
    });

    return unsub;
  }, [documentHydrated]);

  const handleSave = useCallback(async () => {
    if (!pageVersionId) return;
    setSaveStatus('saving');
    try {
      await saveBuilderDocumentDesign(pageVersionId);
      setSaveStatus('saved');
      showSuccess('Design sauvegardé sur le serveur');
    } catch (err) {
      setSaveStatus('dirty');
      const message =
        err instanceof BuilderSaveError || err instanceof BlobUrlValidationError
          ? err.message
          : 'Échec de la sauvegarde. Réessayez.';
      showError(message);
    }
  }, [pageVersionId, showError, showSuccess]);

  const handlePreview = useCallback(async () => {
    if (!pageVersionId) return;
    if (saveStatus === 'loading') return;
    if (saveStatus === 'dirty') {
      try {
        await saveBuilderDocumentDesign(pageVersionId);
        setSaveStatus('saved');
      } catch (err) {
        const message =
          err instanceof BuilderSaveError || err instanceof BlobUrlValidationError
            ? err.message
            : 'Sauvegarde requise avant l’aperçu.';
        showError(message);
        return;
      }
    }
    const previewRevision = useBuilderDocumentStore.getState().documentRevision;
    navigate(getPreviewRoute(pageVersionId), {
      state: buildPreviewNavigationState(previewRevision),
    });
  }, [navigate, pageVersionId, saveStatus, showError]);

  const handleExport = useCallback(async () => {
    if (!pageVersionId) return;
    setExportLoading(true);
    try {
      if (saveStatus === 'dirty') {
        await saveBuilderDocumentDesign(pageVersionId);
        setSaveStatus('saved');
      }
      await exportBuilderV3Zip(pageVersionId);
      showSuccess('Export ZIP téléchargé');
    } catch (err) {
      const message =
        err instanceof BlobUrlValidationError || err instanceof BuilderSaveError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Export ZIP impossible.';
      showError(message);
    } finally {
      setExportLoading(false);
    }
  }, [pageVersionId, saveStatus, showError, showSuccess]);

  const subtitle = pageVersionId
    ? `Version ${pageVersionId.slice(0, 8)}…`
    : undefined;

  return (
    <>
      <StudioLayout
        documentHydrated={documentHydrated}
        onOpenPageSettings={() => setPageSettingsOpen(true)}
        header={
          <StudioTopBar
            subtitle={subtitle}
            deviceMode={deviceMode}
            saveStatus={saveStatus}
            documentLoading={!documentHydrated}
            onDeviceModeChange={setDeviceMode}
            onSave={() => void handleSave()}
            onPreview={() => void handlePreview()}
            onExport={() => void handleExport()}
            exportLoading={exportLoading}
            onOpenPageSettings={() => setPageSettingsOpen(true)}
          />
        }
      />
      <PageSettingsSheet open={pageSettingsOpen} onOpenChange={setPageSettingsOpen} />
      <StudioToast toast={toast} onDismiss={dismiss} />
    </>
  );
}
