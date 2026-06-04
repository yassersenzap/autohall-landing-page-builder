import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  BuilderSidebar,
  type BuilderSidebarTab,
} from '../features/editor/components/BuilderSidebar';
import { EditorCanvas } from '../features/editor/components/EditorCanvas';
import { EditorStudioLayout } from '../features/editor/components/EditorStudioLayout';
import { PropertiesPanel } from '../features/editor/components/PropertiesPanel';
import { StudioTopBar } from '../features/editor/components/StudioTopBar';
import { TemplateApplyDialog } from '../features/editor/components/TemplateApplyDialog';
import { usePageEditor } from '../features/editor/hooks/usePageEditor';
import {
  useApplyLandingTemplate,
  type TemplateApplyMode,
} from '../features/landing/useApplyLandingTemplate';
import type { LandingTemplateId } from '../features/landing/landing-templates';
import {
  DEFAULT_EDITOR_BLOCK_PROPS,
  EDITOR_BLOCK_LIBRARY,
  type EditorBlockType,
  type EditorDeviceMode,
} from '../features/editor/types/editor.types';
import { downloadPageVersionExport } from '../lib/page-export';
import { publishPageVersion } from '../lib/page-versions';

const LAST_DRAFT_STORAGE_KEY = 'autohall-studio-last-draft';

type LocationState = {
  versionNumber?: number;
  versionLabel?: string | null;
  versionStatus?: string;
  landingPageId?: string;
  landingPageTitle?: string;
  campaignId?: string;
  campaignName?: string;
  applyTemplate?: LandingTemplateId;
};

export default function PageVersionBlocksPage() {
  const { pageVersionId } = useParams<{ pageVersionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? {};
  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deviceMode, setDeviceMode] = useState<EditorDeviceMode>('desktop');
  const [sidebarTab, setSidebarTab] = useState<BuilderSidebarTab>('blocks');
  const [versionStatus, setVersionStatus] = useState<string | undefined>(state.versionStatus);
  const [selectedTemplateId, setSelectedTemplateId] = useState<LandingTemplateId | null>(
    state.applyTemplate ?? null,
  );
  const [pendingTemplateId, setPendingTemplateId] = useState<LandingTemplateId | null>(null);
  const templateAutoAppliedRef = useRef(false);

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
    document.documentElement.classList.add('lpb-studio-active');
    return () => document.documentElement.classList.remove('lpb-studio-active');
  }, []);

  if (!pageVersionId) {
    return <p className="ui-alert ui-alert--error">Identifiant de version invalide.</p>;
  }
  const pageVersionIdValue = pageVersionId;

  const navigateToLogin = useCallback(
    () => navigate('/login', { replace: true }),
    [navigate],
  );

  const {
    blocks,
    selectedBlockId,
    selectedBlock,
    selectBlock,
    status,
    load,
    createBlock,
    updateBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
  } = usePageEditor({
    pageVersionId: pageVersionIdValue,
    navigateToLogin,
  });

  const {
    applying: applyingTemplate,
    error: templateError,
    applyTemplate,
  } = useApplyLandingTemplate(pageVersionIdValue, status.canWrite);

  const versionTitle =
    state.versionNumber != null
      ? `v${state.versionNumber}${state.versionLabel ? ` — ${state.versionLabel}` : ''}`
      : `Version ${pageVersionId}`;

  useEffect(() => {
    try {
      localStorage.setItem(
        LAST_DRAFT_STORAGE_KEY,
        JSON.stringify({
          pageVersionId,
          label: versionTitle,
        }),
      );
    } catch {
      // Ignore storage errors
    }
  }, [pageVersionId, versionTitle]);

  useEffect(() => {
    if (
      status.loading ||
      blocks.length > 0 ||
      !state.applyTemplate ||
      !status.canWrite ||
      templateAutoAppliedRef.current
    ) {
      return;
    }

    templateAutoAppliedRef.current = true;
    setSelectedTemplateId(state.applyTemplate);
    setSidebarTab('templates');

    void applyTemplate(state.applyTemplate, { mode: 'replace', existingBlocks: [] }).then(
      (created) => {
        if (created?.length) void load();
      },
    );
  }, [
    applyTemplate,
    blocks.length,
    load,
    state.applyTemplate,
    status.canWrite,
    status.loading,
  ]);

  async function runApplyTemplate(templateId: LandingTemplateId, mode: TemplateApplyMode) {
    setSelectedTemplateId(templateId);
    const created = await applyTemplate(templateId, {
      mode,
      existingBlocks: blocks,
    });
    if (created?.length) {
      await load();
    }
    setPendingTemplateId(null);
  }

  function handleSelectTemplate(templateId: LandingTemplateId) {
    if (blocks.length === 0) {
      void runApplyTemplate(templateId, 'replace');
      return;
    }
    setPendingTemplateId(templateId);
  }

  async function handleAddBlock(blockType: EditorBlockType) {
    await createBlock({
      blockType,
      propsJson: DEFAULT_EDITOR_BLOCK_PROPS[blockType],
    });
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishPageVersion(pageVersionIdValue);
      setVersionStatus('PUBLISHED');
      await load();
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
    } finally {
      setExporting(false);
    }
  }

  const hasErrorBanner = Boolean(status.error || templateError);

  return (
    <>
      {pendingTemplateId ? (
        <TemplateApplyDialog
          templateId={pendingTemplateId}
          existingBlockCount={blocks.length}
          applying={applyingTemplate}
          onCancel={() => setPendingTemplateId(null)}
          onConfirm={(mode) => void runApplyTemplate(pendingTemplateId, mode)}
        />
      ) : null}

      <EditorStudioLayout
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
            previewTo={`/page-versions/${pageVersionId}/preview`}
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
            onPublish={() => void handlePublish()}
            onExport={() => void handleExport()}
            backTo={versionsBackLink.to}
            backLabel={versionsBackLink.label}
            backState={versionsBackLink.state}
          />
        }
        banner={
          hasErrorBanner ? (
            <>
              {status.error ? <p className="ui-alert ui-alert--error">{status.error}</p> : null}
              {templateError ? <p className="ui-alert ui-alert--error">{templateError}</p> : null}
            </>
          ) : null
        }
        left={
          <BuilderSidebar
            tab={sidebarTab}
            onTabChange={setSidebarTab}
            blocks={EDITOR_BLOCK_LIBRARY}
            pageBlocks={blocks}
            selectedBlockId={selectedBlockId}
            canWrite={status.canWrite && !status.mutationBusy}
            applyingTemplate={applyingTemplate}
            selectedTemplateId={selectedTemplateId}
            onAddBlock={(type) => void handleAddBlock(type)}
            onSelectBlock={selectBlock}
            onSelectTemplate={handleSelectTemplate}
          />
        }
        center={
          <div className="flex min-h-0 flex-1 flex-col items-center overflow-auto p-4 sm:p-6 [background-image:radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--foreground)_5%,transparent)_1px,transparent_0)] [background-size:20px_20px]">
            {status.loading ? (
              <p className="py-16 text-sm text-muted-foreground">Chargement des sections…</p>
            ) : (
              <EditorCanvas
                blocks={blocks}
                selectedBlockId={selectedBlockId}
                canWrite={status.canWrite && !status.mutationBusy}
                onSelectBlock={selectBlock}
                onMoveUp={(blockId) => {
                  const index = blocks.findIndex((b) => b.id === blockId);
                  if (index > 0) void moveBlock(blockId, index - 1);
                }}
                onMoveDown={(blockId) => {
                  const index = blocks.findIndex((b) => b.id === blockId);
                  if (index >= 0 && index < blocks.length - 1) void moveBlock(blockId, index + 1);
                }}
                onReorder={(blockId, newIndex) => void moveBlock(blockId, newIndex)}
                onDuplicateBlock={(blockId) => void duplicateBlock(blockId)}
                onDeleteBlock={(blockId) => void deleteBlock(blockId)}
                onQuickAddHero={() => void handleAddBlock('hero')}
                deviceMode={deviceMode}
              />
            )}
          </div>
        }
        right={
          <PropertiesPanel
            selectedBlock={selectedBlock}
            canWrite={status.canWrite && !status.mutationBusy}
            onChangeProps={(blockId, nextProps) => void updateBlock(blockId, { propsJson: nextProps })}
          />
        }
      />
    </>
  );
}
