import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import '@landing-styles';
import { StudioToast } from '@/components/ui/StudioToast';
import { useStudioToast } from '@/components/ui/use-studio-toast';
import { BuilderEditorProvider } from '@/features/builder-engine/context/BuilderEditorContext';
import { BuilderTriptychLayout } from '@/features/builder-engine/components/BuilderTriptychLayout';
import { BuilderWorkspaceLayout } from '@/features/builder-engine/components/BuilderWorkspaceLayout';
import { apiBlocksToBuilderBlocks } from '@/features/builder-engine/lib/api-block-mapper';
import { persistBuilderDocument } from '@/features/builder-engine/lib/persist-builder-document';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import { StudioTopBar } from '@/features/editor/components/StudioTopBar';
import { usePageEditor } from '@/features/editor/hooks/usePageEditor';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import { parsePageThemeFromJson } from '@/features/builder-engine/lib/page-theme';
import { downloadPageVersionExport } from '@/lib/page-export';
import { fetchPageVersion, publishPageVersion, updatePageVersion } from '@/lib/page-versions';
import { ApiError } from '@/lib/api';

const LAST_DRAFT_STORAGE_KEY = 'autohall-studio-last-draft';

type LocationState = {
  versionNumber?: number;
  versionLabel?: string | null;
  versionStatus?: string;
  landingPageId?: string;
  landingPageTitle?: string;
  campaignId?: string;
  campaignName?: string;
};

export default function PageVersionBlocksPage() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};

  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [versionStatus, setVersionStatus] = useState<string | undefined>(state.versionStatus);

  const baselineRef = useRef<EditorPageBlock[]>([]);

  const setInitialBlocks = useBuilderDocumentStore((s) => s.setInitialBlocks);
  const setInitialPageTheme = useBuilderDocumentStore((s) => s.setInitialPageTheme);
  const buildThemeJsonPayload = useBuilderDocumentStore((s) => s.buildThemeJsonPayload);
  const themeDirty = useBuilderDocumentStore((s) => s.themeDirty);
  const resetDocument = useBuilderDocumentStore((s) => s.resetDocument);
  const documentBlocks = useBuilderDocumentStore((s) => s.blocks);
  const deviceMode = useBuilderDocumentStore((s) => s.deviceMode);
  const setDeviceMode = useBuilderDocumentStore((s) => s.setDeviceMode);

  const { toast, showSuccess, showError, dismiss } = useStudioToast();

  const versionsBackLink =
    state.landingPageId != null
      ? {
          to: `/landing-pages/${state.landingPageId}/versions`,
          state: {
            landingPageTitle: state.landingPageTitle,
            campaignId: state.campaignId,
            campaignName: state.campaignName,
          },
          label: 'Versions',
        }
      : { to: '/campaigns', state: undefined, label: 'Campagnes' };

  useEffect(() => {
    return () => {
      resetDocument();
    };
  }, [resetDocument]);

  const navigateToLogin = useCallback(
    () => navigate('/login', { replace: true }),
    [navigate],
  );

  if (!pageVersionId) {
    return <p className="ui-alert ui-alert--error">Identifiant de version invalide.</p>;
  }

  const pageVersionIdValue = pageVersionId;

  const { blocks: apiBlocks, status, load } = usePageEditor({
    pageVersionId: pageVersionIdValue,
    navigateToLogin,
  });

  const versionTitle =
    state.versionNumber != null
      ? `v${state.versionNumber}${state.versionLabel ? ` — ${state.versionLabel}` : ''}`
      : `Version ${pageVersionIdValue}`;

  const canEditDocument =
    status.canWrite && versionStatus !== 'PUBLISHED' && !status.loading;

  useEffect(() => {
    try {
      localStorage.setItem(
        LAST_DRAFT_STORAGE_KEY,
        JSON.stringify({
          pageVersionId: pageVersionIdValue,
          label: versionTitle,
        }),
      );
    } catch {
      // Ignore storage errors
    }
  }, [pageVersionIdValue, versionTitle]);

  useEffect(() => {
    if (status.loading) return;

    const sorted = [...apiBlocks].sort((a, b) => a.sortOrder - b.sortOrder);
    baselineRef.current = sorted.map((block) => ({
      ...block,
      propsJson:
        block.propsJson && typeof block.propsJson === 'object'
          ? { ...block.propsJson }
          : {},
    }));

    setInitialBlocks(apiBlocksToBuilderBlocks(sorted));
  }, [apiBlocks, setInitialBlocks, status.loading]);

  useEffect(() => {
    if (!state.landingPageId || status.loading) return;

    void fetchPageVersion(state.landingPageId, pageVersionIdValue)
      .then((response) => {
        setInitialPageTheme(parsePageThemeFromJson(response.data.themeJson));
      })
      .catch(() => {
        // Thème optionnel — ne bloque pas l’éditeur
      });
  }, [
    pageVersionIdValue,
    setInitialPageTheme,
    state.landingPageId,
    status.loading,
  ]);

  async function handleSave() {
    if (!canEditDocument) return;

    setIsSaving(true);
    try {
      await persistBuilderDocument(
        pageVersionIdValue,
        documentBlocks,
        baselineRef.current,
      );
      if (themeDirty && state.landingPageId) {
        await updatePageVersion(state.landingPageId, pageVersionIdValue, {
          themeJson: buildThemeJsonPayload(),
        });
      }
      await load();
      showSuccess('Landing sauvegardée.');
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Échec de la sauvegarde.';
      showError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishPageVersion(pageVersionIdValue);
      setVersionStatus('PUBLISHED');
      await load();
      showSuccess('Version publiée.');
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Échec de la publication.');
    } finally {
      setPublishing(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      await downloadPageVersionExport(
        pageVersionIdValue,
        state.versionNumber ? `landing-v${state.versionNumber}.zip` : undefined,
      );
      showSuccess('Export ZIP téléchargé.');
    } catch (err) {
      showError(err instanceof ApiError ? err.message : 'Échec de l’export.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <BuilderEditorProvider
      canWrite={canEditDocument}
      pageVersionId={pageVersionIdValue}
      landingPageId={state.landingPageId ?? null}
    >
      <BuilderWorkspaceLayout
        topbar={
          <StudioTopBar
            campaignName={state.campaignName}
            landingTitle={state.landingPageTitle}
            versionLabel={versionTitle}
            status={versionStatus}
            canWrite={status.canWrite}
            publishing={publishing}
            exporting={exporting}
            deviceMode={deviceMode}
            previewTo={`/page-versions/${pageVersionIdValue}/preview`}
            previewState={{
              versionNumber: state.versionNumber,
              versionLabel: state.versionLabel,
              landingPageId: state.landingPageId,
              landingPageTitle: state.landingPageTitle,
              campaignId: state.campaignId,
              campaignName: state.campaignName,
            }}
            onDeviceModeChange={setDeviceMode}
            onRefresh={() => void load()}
            onSave={() => void handleSave()}
            isSaving={isSaving}
            onPublish={() => void handlePublish()}
            onExport={() => void handleExport()}
            backTo={versionsBackLink.to}
            backLabel={versionsBackLink.label}
            backState={versionsBackLink.state}
          />
        }
        banner={status.error ? status.error : undefined}
      >
        {status.loading ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Chargement des sections…
          </p>
        ) : (
          <BuilderTriptychLayout />
        )}
      </BuilderWorkspaceLayout>

      <StudioToast toast={toast} onDismiss={dismiss} />
    </BuilderEditorProvider>
  );
}
