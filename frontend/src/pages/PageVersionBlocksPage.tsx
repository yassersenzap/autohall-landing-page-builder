import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import '@landing-styles';
import { StudioToast } from '@/components/ui/StudioToast';
import { useStudioToast } from '@/components/ui/use-studio-toast';
import { DraftRestoreDialog } from '@/features/builder-engine/components/DraftRestoreDialog';
import { BuilderEditorProvider } from '@/features/builder-engine/context/BuilderEditorContext';
import { BuilderWorkspaceControls } from '@/features/builder-engine/components/BuilderWorkspaceControls';
import { BuilderTriptychLayout } from '@/features/builder-engine/components/BuilderTriptychLayout';
import { WorkspaceUiProvider } from '@/features/builder-engine/context/WorkspaceUiContext';
import { BuilderWorkspaceLayout } from '@/features/builder-engine/components/BuilderWorkspaceLayout';
import { apiBlocksToBuilderBlocks } from '@/features/builder-engine/lib/api-block-mapper';
import {
  clearLocalDraft,
  readLocalDraft,
  shouldOfferLocalDraftRestore,
  writeLocalDraft,
  type BuilderLocalDraft,
} from '@/features/builder-engine/lib/builder-local-draft';
import { isBuilderDocumentDirty } from '@/features/builder-engine/lib/compare-builder-document';
import { persistBuilderDocument } from '@/features/builder-engine/lib/persist-builder-document';
import { useBeforeUnload } from '@/features/builder-engine/lib/use-before-unload';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';
import {
  StudioTopBar,
  type BuilderSaveStatus,
} from '@/features/editor/components/StudioTopBar';
import { usePageEditor } from '@/features/editor/hooks/usePageEditor';
import type { EditorPageBlock } from '@/features/editor/types/editor.types';
import { parsePageThemeFromJson } from '@/features/builder-engine/lib/page-theme';
import {
  getCriticalPageReadinessIssues,
  getPageReadinessIssues,
} from '@/features/builder-engine/lib/page-readiness';
import { downloadPageVersionExport } from '@/lib/page-export';
import { fetchPageVersion, publishPageVersion, updatePageVersion } from '@/lib/page-versions';
import { ApiError } from '@/lib/api';

const LAST_DRAFT_STORAGE_KEY = 'autohall-studio-last-draft';
const LOCAL_DRAFT_DEBOUNCE_MS = 500;

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
  const [saveError, setSaveError] = useState(false);
  const [versionStatus, setVersionStatus] = useState<string | undefined>(state.versionStatus);
  const [pendingDraft, setPendingDraft] = useState<BuilderLocalDraft | null>(null);

  const baselineRef = useRef<EditorPageBlock[]>([]);
  const draftPromptCheckedRef = useRef(false);

  const setInitialBlocks = useBuilderDocumentStore((s) => s.setInitialBlocks);
  const setInitialPageTheme = useBuilderDocumentStore((s) => s.setInitialPageTheme);
  const restoreLocalDraft = useBuilderDocumentStore((s) => s.restoreLocalDraft);
  const buildThemeJsonPayload = useBuilderDocumentStore((s) => s.buildThemeJsonPayload);
  const themeDirty = useBuilderDocumentStore((s) => s.themeDirty);
  const pageTheme = useBuilderDocumentStore((s) => s.pageTheme);
  const selectedBlockId = useBuilderDocumentStore((s) => s.selectedBlockId);
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
      draftPromptCheckedRef.current = false;
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

  const isDocumentDirty = useMemo(() => {
    const sorted = [...apiBlocks].sort((a, b) => a.sortOrder - b.sortOrder);
    return isBuilderDocumentDirty(documentBlocks, sorted, themeDirty);
  }, [apiBlocks, documentBlocks, themeDirty]);

  const saveStatus: BuilderSaveStatus = isSaving
    ? 'saving'
    : saveError
      ? 'error'
      : isDocumentDirty
        ? 'dirty'
        : 'saved';

  useBeforeUnload(canEditDocument && isDocumentDirty);

  const previewState = {
    versionNumber: state.versionNumber,
    versionLabel: state.versionLabel,
    landingPageId: state.landingPageId,
    landingPageTitle: state.landingPageTitle,
    campaignId: state.campaignId,
    campaignName: state.campaignName,
  };

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

    if (!draftPromptCheckedRef.current) {
      draftPromptCheckedRef.current = true;
      const draft = readLocalDraft(pageVersionIdValue);
      if (draft && shouldOfferLocalDraftRestore(draft, sorted)) {
        setPendingDraft(draft);
      } else if (draft) {
        clearLocalDraft(pageVersionIdValue);
      }
    }
  }, [apiBlocks, pageVersionIdValue, setInitialBlocks, status.loading]);

  useEffect(() => {
    if (!state.landingPageId || status.loading) return;

    void fetchPageVersion(state.landingPageId, pageVersionIdValue)
      .then((response) => {
        setInitialPageTheme(parsePageThemeFromJson(response.data.themeJson));
      })
      .catch(() => {
        // Thème optionnel
      });
  }, [
    pageVersionIdValue,
    setInitialPageTheme,
    state.landingPageId,
    status.loading,
  ]);

  useEffect(() => {
    if (!canEditDocument || !isDocumentDirty) return;

    const timer = window.setTimeout(() => {
      writeLocalDraft({
        version: 1,
        pageVersionId: pageVersionIdValue,
        updatedAt: Date.now(),
        blocks: documentBlocks.map((block) => ({
          ...block,
          propsJson: { ...block.propsJson },
        })),
        pageTheme: { ...pageTheme },
        themeDirty,
        selectedBlockId,
      });
    }, LOCAL_DRAFT_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [
    canEditDocument,
    documentBlocks,
    isDocumentDirty,
    pageTheme,
    pageVersionIdValue,
    selectedBlockId,
    themeDirty,
  ]);

  useEffect(() => {
    if (isDocumentDirty) {
      setSaveError(false);
    }
  }, [isDocumentDirty]);

  async function handleSave(): Promise<boolean> {
    if (!canEditDocument) return false;

    setIsSaving(true);
    setSaveError(false);
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
      clearLocalDraft(pageVersionIdValue);
      await load();
      showSuccess('Landing enregistrée.');
      return true;
    } catch (err) {
      setSaveError(true);
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Échec de l’enregistrement.';
      showError(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  function requireSavedDocument(actionLabel: string): boolean {
    if (!isDocumentDirty) return true;
    showError(
      `${actionLabel} : enregistrez vos modifications pour synchroniser l’aperçu et l’export.`,
    );
    return false;
  }

  function handlePreview() {
    if (!requireSavedDocument('Aperçu')) return;
    navigate(`/page-versions/${pageVersionIdValue}/preview`, { state: previewState });
  }

  async function handleSaveAndPreview() {
    const saved = await handleSave();
    if (!saved) return;
    navigate(`/page-versions/${pageVersionIdValue}/preview`, { state: previewState });
  }

  function handleRestoreDraft() {
    if (!pendingDraft) return;
    restoreLocalDraft({
      blocks: pendingDraft.blocks,
      pageTheme: pendingDraft.pageTheme,
      themeDirty: pendingDraft.themeDirty,
      selectedBlockId: pendingDraft.selectedBlockId,
    });
    setPendingDraft(null);
    showSuccess('Brouillon local restauré. Pensez à enregistrer.');
  }

  function handleIgnoreDraft() {
    clearLocalDraft(pageVersionIdValue);
    setPendingDraft(null);
  }

  function handleReloadFromServer() {
    if (isDocumentDirty) {
      const confirmed = window.confirm(
        'Recharger depuis le serveur ? Les modifications non enregistrées seront perdues.',
      );
      if (!confirmed) return;
    }
    clearLocalDraft(pageVersionIdValue);
    draftPromptCheckedRef.current = false;
    void load();
  }

  async function handlePublish() {
    if (!requireSavedDocument('Publication')) return;

    const doc = useBuilderDocumentStore.getState();
    const critical = getCriticalPageReadinessIssues(
      getPageReadinessIssues(doc.blocks, doc.pageTheme),
    );
    if (critical.length > 0) {
      showError(
        `Publication impossible : ${critical.map((issue) => issue.message).join(' ')}`,
      );
      return;
    }

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
    if (!requireSavedDocument('Export')) return;

    const doc = useBuilderDocumentStore.getState();
    const critical = getCriticalPageReadinessIssues(
      getPageReadinessIssues(doc.blocks, doc.pageTheme),
    );
    if (critical.length > 0) {
      showError(
        `Export : contenu incomplet — ${critical.map((issue) => issue.message).join(' ')}`,
      );
    }

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
      <WorkspaceUiProvider>
      <BuilderWorkspaceLayout
        topbar={
          <StudioTopBar
            workspaceToolbar={
              <>
                <BuilderWorkspaceControls />
                <Link
                  to={`/page-versions/${pageVersionIdValue}/studio-v2`}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-[0.65rem] font-medium text-primary hover:bg-primary/10"
                  title="Éditeur visuel V2 (Puck) — document séparé du builder blocs"
                >
                  <Sparkles className="h-3 w-3" aria-hidden />
                  Studio V2
                </Link>
              </>
            }
            campaignName={state.campaignName}
            landingTitle={state.landingPageTitle}
            versionLabel={versionTitle}
            status={versionStatus}
            canWrite={status.canWrite}
            publishing={publishing}
            exporting={exporting}
            deviceMode={deviceMode}
            saveStatus={canEditDocument ? saveStatus : 'saved'}
            onDeviceModeChange={setDeviceMode}
            onRefresh={handleReloadFromServer}
            onSave={() => void handleSave()}
            onSaveAndPreview={() => void handleSaveAndPreview()}
            onPreview={handlePreview}
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
      </WorkspaceUiProvider>

      {pendingDraft ? (
        <DraftRestoreDialog
          updatedAt={pendingDraft.updatedAt}
          onRestore={handleRestoreDraft}
          onIgnore={handleIgnoreDraft}
        />
      ) : null}

      <StudioToast toast={toast} onDismiss={dismiss} />
    </BuilderEditorProvider>
  );
}
