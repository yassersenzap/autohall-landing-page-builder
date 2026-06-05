import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getPreviewRoute } from '@/lib/landing-studio-routes';
import { persistStudioSessionFromVersion } from '@/lib/studio-session';
import type { Data } from '@puckeditor/core';
import {
  fetchStudioV2Document,
  saveStudioV2Document,
} from '@/features/visual-studio-v2/api/studio-v2-document.api';
import {
  downloadStudioV2Export,
  fetchStudioV2Readiness,
} from '@/features/visual-studio-v2/api/studio-v2-preview.api';
import { StudioV2LoadError } from '@/features/visual-studio-v2/components/StudioV2LoadError';
import {
  StudioV2Toolbar,
  type StudioV2Viewport,
  type StudioV2Zoom,
} from '@/features/visual-studio-v2/components/StudioV2Toolbar';
import { MediaPickerModal } from '@/features/visual-studio-v2/components/MediaPickerModal';
import { StudioV2CreativeSidebar } from '@/features/visual-studio-v2/components/StudioV2CreativeSidebar';
import { StudioV2Provider, type StudioV2Actions } from '@/features/visual-studio-v2/context/StudioV2Context';
import {
  insertBlockIntoDocument,
  insertSectionByLibraryId,
  insertSectionsIntoDocument,
} from '@/features/visual-studio-v2/lib/document-insert';
import { getSectionLibraryEntry } from '@/features/visual-studio-v2/creative-engine/section-library';
import {
  VisualStudioV2Editor,
  type VisualStudioV2EditorHandle,
} from '@/features/visual-studio-v2/VisualStudioV2Editor';
import { useStudioV2Permissions } from '@/features/visual-studio-v2/hooks/useStudioV2Permissions';
import { ensurePuckIds } from '@/features/visual-studio-v2/lib/ensure-puck-ids';
import { validateStudioV2Readiness, type ReadinessIssue } from '@/features/visual-studio-v2/lib/readiness';
import {
  STUDIO_V2_TEMPLATES,
  type StudioV2TemplateId,
} from '@/features/visual-studio-v2/templates/index';
import type { StudioV2SaveStatus } from '@/features/visual-studio-v2/types';

type StudioLocationState = {
  versionNumber?: number;
  versionLabel?: string | null;
  landingPageId?: string;
  landingPageTitle?: string | null;
  campaignId?: string;
  campaignName?: string | null;
};

export default function VisualStudioV2Page() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as StudioLocationState | null) ?? {};
  const editorRef = useRef<VisualStudioV2EditorHandle>(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveStatus, setSaveStatus] = useState<StudioV2SaveStatus>('loading');
  const [documentData, setDocumentData] = useState<Data | null>(null);
  const [savedBaseline, setSavedBaseline] = useState<Data | null>(null);
  const [documentKey, setDocumentKey] = useState(0);
  const [viewport, setViewport] = useState<StudioV2Viewport>('desktop');
  const [zoom, setZoom] = useState<StudioV2Zoom>('fit');
  const [readinessIssues, setReadinessIssues] = useState<ReadinessIssue[]>([]);
  const [canExport, setCanExport] = useState(true);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'starters' | 'sections' | undefined>(undefined);

  const navigateToLogin = useCallback(
    () => navigate('/login', { replace: true }),
    [navigate],
  );

  const { canWrite } = useStudioV2Permissions({ navigateToLogin });

  const pageTitle = useMemo(() => {
    const title = documentData?.root?.props?.title;
    return typeof title === 'string' ? title : undefined;
  }, [documentData]);

  const backNavigation = useMemo(() => {
    if (navState.landingPageId) {
      return {
        backTo: `/landing-pages/${navState.landingPageId}/versions`,
        backLabel: 'Versions',
        backState: {
          landingPageTitle: navState.landingPageTitle,
          campaignId: navState.campaignId,
          campaignName: navState.campaignName,
        },
      };
    }
    return { backTo: '/campaigns', backLabel: 'Campagnes', backState: undefined };
  }, [navState]);

  const versionLabel = useMemo(() => {
    if (navState.versionNumber != null) {
      const base = `v${navState.versionNumber}`;
      return navState.versionLabel ? `${base} — ${navState.versionLabel}` : base;
    }
    return navState.landingPageTitle ?? undefined;
  }, [navState]);

  const refreshReadiness = useCallback(
    async (data?: Data) => {
      if (!pageVersionId) return;
      const source = data ?? documentData;
      if (!source) return;

      const local = validateStudioV2Readiness(source);
      setReadinessIssues(local);
      setCanExport(!local.some((i) => i.level === 'critical'));

      try {
        const remote = await fetchStudioV2Readiness(pageVersionId);
        setReadinessIssues(remote.issues);
        setCanExport(remote.canExport);
      } catch {
        setCanExport(!local.some((i) => i.level === 'critical'));
      }
    },
    [documentData, pageVersionId],
  );

  useEffect(() => {
    if (!pageVersionId) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSaveStatus('loading');

    void fetchStudioV2Document(pageVersionId)
      .then((record) => {
        if (cancelled) return;
        const data = ensurePuckIds(record.documentJson);
        setSavedBaseline(data);
        setDocumentData(data);
        setDocumentKey((key) => key + 1);
        setSaveStatus('saved');
        setReadinessIssues(validateStudioV2Readiness(data));
        setCanExport(
          !validateStudioV2Readiness(data).some((i) => i.level === 'critical'),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error
            ? err.message
            : 'Impossible de charger la landing.',
        );
        setSaveStatus('error');
        setDocumentData(null);
        setSavedBaseline(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [pageVersionId, loadAttempt]);

  useEffect(() => {
    if (!pageVersionId || navState.versionNumber == null) return;
    persistStudioSessionFromVersion({
      pageVersionId,
      versionNumber: navState.versionNumber,
      versionLabel: navState.versionLabel,
      landingPageId: navState.landingPageId,
      landingPageTitle: navState.landingPageTitle,
      campaignId: navState.campaignId,
      campaignName: navState.campaignName,
    });
  }, [navState, pageVersionId]);

  useEffect(() => {
    if (!pageVersionId || loading || !documentData) return;

    void fetchStudioV2Readiness(pageVersionId)
      .then((remote) => {
        setReadinessIssues(remote.issues);
        setCanExport(remote.canExport);
      })
      .catch(() => {
        const local = validateStudioV2Readiness(documentData);
        setCanExport(!local.some((i) => i.level === 'critical'));
      });
  }, [pageVersionId, loading, documentData]);

  const handleRetryLoad = useCallback(() => {
    setLoadAttempt((attempt) => attempt + 1);
  }, []);

  const handleDirtyChange = useCallback((dirty: boolean) => {
    setSaveStatus(dirty ? 'dirty' : 'saved');
    const current = editorRef.current?.getData();
    if (current) {
      setReadinessIssues(validateStudioV2Readiness(current));
    }
  }, []);

  const handleSave = useCallback(
    async (data: Data) => {
      if (!pageVersionId || !canWrite) return;
      setSaveStatus('saving');
      try {
        const saved = await saveStudioV2Document(pageVersionId, data);
        const normalized = ensurePuckIds(saved.documentJson);
        setSavedBaseline(normalized);
        setDocumentData(normalized);
        setSaveStatus('saved');
        if (navState.versionNumber != null) {
          persistStudioSessionFromVersion({
            pageVersionId,
            versionNumber: navState.versionNumber,
            versionLabel: navState.versionLabel,
            landingPageId: navState.landingPageId,
            landingPageTitle: navState.landingPageTitle,
            campaignId: navState.campaignId,
            campaignName: navState.campaignName,
          });
        }
        await refreshReadiness(normalized);
      } catch {
        setSaveStatus('error');
        throw new Error('save failed');
      }
    },
    [canWrite, pageVersionId, refreshReadiness],
  );

  const handleSaveClick = useCallback(() => {
    const current = editorRef.current?.getData();
    if (!current) return;
    void handleSave(current);
  }, [handleSave]);

  const handlePreview = useCallback(async () => {
    if (!pageVersionId) return;
    if (saveStatus === 'dirty') {
      const current = editorRef.current?.getData();
      if (current) await handleSave(current);
    }
    navigate(getPreviewRoute(pageVersionId), { state: navState });
  }, [handleSave, navigate, pageVersionId, saveStatus]);

  const handleExport = useCallback(async () => {
    if (!pageVersionId) return;
    if (saveStatus === 'dirty') {
      const current = editorRef.current?.getData();
      if (current) await handleSave(current);
    }
    await downloadStudioV2Export(pageVersionId);
    await refreshReadiness();
  }, [handleSave, pageVersionId, refreshReadiness, saveStatus]);

  const applyDocument = useCallback((next: Data) => {
    setDocumentData(next);
    setDocumentKey((k) => k + 1);
    setSaveStatus('dirty');
    setReadinessIssues(validateStudioV2Readiness(next));
  }, []);

  const handleApplyTemplate = useCallback(
    (templateId: StudioV2TemplateId) => {
      const template = STUDIO_V2_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      applyDocument(template.build());
    },
    [applyDocument],
  );

  const handleInsertSection = useCallback(
    (sectionLibraryId: string) => {
      const current = editorRef.current?.getData() ?? documentData;
      if (!current) return;
      const next = insertSectionByLibraryId(current, sectionLibraryId);
      if (next) applyDocument(next);
    },
    [applyDocument, documentData],
  );

  const handleInsertSectionAfter = useCallback(
    (sectionId?: string) => {
      const current = editorRef.current?.getData() ?? documentData;
      if (!current) return;
      const entry = getSectionLibraryEntry('text-image-section');
      if (!entry) return;
      const next = insertSectionsIntoDocument(current, entry.build(), sectionId);
      applyDocument(next);
    },
    [applyDocument, documentData],
  );

  const handleInsertBlock = useCallback(
    (blockId: string) => {
      const current = editorRef.current?.getData() ?? documentData;
      if (!current) return;
      const next = insertBlockIntoDocument(current, blockId);
      if (next) applyDocument(next);
    },
    [applyDocument, documentData],
  );

  const studioActions = useMemo<StudioV2Actions>(
    () => ({
      canWrite,
      onApplyStarter: (id) => handleApplyTemplate(id as StudioV2TemplateId),
      onInsertSectionAfter: handleInsertSectionAfter,
      onOpenMediaPicker: () => setMediaPickerOpen(true),
      onFocusStarterTab: () => setSidebarTab('starters'),
      onFocusSectionTab: () => setSidebarTab('sections'),
    }),
    [canWrite, handleApplyTemplate, handleInsertSectionAfter],
  );

  if (!pageVersionId) {
    return <p className="p-6 text-sm text-muted-foreground">Identifiant de version manquant.</p>;
  }

  return (
    <StudioV2Provider pageVersionId={pageVersionId} canWrite={canWrite} actions={studioActions}>
      <div className="visual-studio-v2-shell">
        <StudioV2Toolbar
          backTo={backNavigation.backTo}
          backLabel={backNavigation.backLabel}
          backState={backNavigation.backState}
          pageTitle={pageTitle}
          versionLabel={versionLabel}
          saveStatus={saveStatus}
          canWrite={canWrite}
          viewport={viewport}
          zoom={zoom}
          onViewportChange={setViewport}
          onZoomChange={setZoom}
          onSave={handleSaveClick}
          onPreview={() => void handlePreview()}
          onExport={() => void handleExport()}
          exportDisabled={!canExport}
        />

        {loading ? (
          <p className="visual-studio-v2-loading p-6 text-sm">Chargement de la landing…</p>
        ) : loadError ? (
          <StudioV2LoadError
            backTo={backNavigation.backTo}
            backLabel={backNavigation.backLabel}
            backState={backNavigation.backState}
            message={loadError}
            onRetry={handleRetryLoad}
          />
        ) : documentData && savedBaseline ? (
          <div className="visual-studio-v2-workspace">
            <StudioV2CreativeSidebar
              pageVersionId={pageVersionId}
              canWrite={canWrite}
              documentData={documentData}
              readinessIssues={readinessIssues}
              hasExistingContent={(documentData.content?.length ?? 0) > 0}
              initialTab={sidebarTab}
              onApplyStarter={handleApplyTemplate}
              onInsertSection={handleInsertSection}
              onInsertBlock={handleInsertBlock}
            />
            <MediaPickerModal
              open={mediaPickerOpen}
              pageVersionId={pageVersionId}
              canWrite={canWrite}
              onSelect={() => setMediaPickerOpen(false)}
              onClose={() => setMediaPickerOpen(false)}
            />
            <VisualStudioV2Editor
              key={`${pageVersionId}-${documentKey}`}
              ref={editorRef}
              initialData={documentData}
              savedBaseline={savedBaseline}
              canWrite={canWrite}
              saveStatus={saveStatus}
              viewport={viewport}
              zoom={zoom}
              onDirtyChange={handleDirtyChange}
              onSave={handleSave}
            />
          </div>
        ) : (
          <StudioV2LoadError
            backTo={backNavigation.backTo}
            backLabel={backNavigation.backLabel}
            backState={backNavigation.backState}
            message="La landing est vide ou invalide."
            onRetry={handleRetryLoad}
          />
        )}
      </div>
    </StudioV2Provider>
  );
}
