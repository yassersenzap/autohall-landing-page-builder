import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { BlockLibrary } from '../features/editor/components/BlockLibrary';
import { BlockNavigator } from '../features/editor/components/BlockNavigator';
import { EditorCanvas } from '../features/editor/components/EditorCanvas';
import { EditorShell } from '../features/editor/components/EditorShell';
import { EditorToolbar } from '../features/editor/components/EditorToolbar';
import { PropertiesPanel } from '../features/editor/components/PropertiesPanel';
import { usePageEditor } from '../features/editor/hooks/usePageEditor';
import {
  DEFAULT_EDITOR_BLOCK_PROPS,
  EDITOR_BLOCK_LIBRARY,
  type EditorBlockType,
  type EditorDeviceMode,
} from '../features/editor/types/editor.types';
import { downloadPageVersionExport } from '../lib/page-export';
import { publishPageVersion } from '../lib/page-versions';
import '../features/editor/editor.css';

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
  const [deviceMode, setDeviceMode] = useState<EditorDeviceMode>('desktop');
  const [versionStatus, setVersionStatus] = useState<string | undefined>(
    state.versionStatus,
  );

  const versionsBackLink =
    state.landingPageId != null
      ? {
          to: `/landing-pages/${state.landingPageId}/versions`,
          state: {
            landingPageTitle: state.landingPageTitle,
            campaignId: state.campaignId,
            campaignName: state.campaignName,
          },
          label: 'Retour aux versions',
        }
      : { to: '/campaigns', state: undefined, label: 'Retour aux campagnes' };

  if (!pageVersionId) {
    return (
      <p className="ui-alert ui-alert--error">Identifiant de version invalide.</p>
    );
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
    moveBlock,
  } = usePageEditor({
    pageVersionId: pageVersionIdValue,
    navigateToLogin,
  });

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

  return (
    <div className="studio-stack">
      <Card title="Étape en cours">
        <ol className="studio-workflow">
          <li className="studio-workflow__item">Campagnes</li>
          <li className="studio-workflow__item">Landing pages & versions</li>
          <li className="studio-workflow__item studio-workflow__item--active">Visual editor</li>
          <li className="studio-workflow__item">Preview</li>
          <li className="studio-workflow__item">Publish & Export ZIP</li>
        </ol>
      </Card>
      <EditorShell
        toolbar={
          <EditorToolbar
            title="Visual Builder Editor"
            subtitle={
              `${versionTitle}${state.versionStatus ? ` (${state.versionStatus})` : ''}${
                state.landingPageTitle ? ` — ${state.landingPageTitle}` : ''
              }`
            }
            status={versionStatus}
            canWrite={status.canWrite}
            publishing={publishing}
            exporting={exporting}
            previewTo={`/page-versions/${pageVersionId}/preview`}
            previewState={{
              versionNumber: state.versionNumber,
              versionLabel: state.versionLabel,
              landingPageId: state.landingPageId,
              landingPageTitle: state.landingPageTitle,
              campaignId: state.campaignId,
              campaignName: state.campaignName,
            }}
            onPublish={() => void handlePublish()}
            onExport={() => void handleExport()}
            onRefresh={() => void load()}
            backTo={versionsBackLink.to}
            backLabel={versionsBackLink.label}
            backState={versionsBackLink.state}
            deviceMode={deviceMode}
            onChangeDeviceMode={setDeviceMode}
          />
        }
        left={
          <>
            <BlockLibrary
              blocks={EDITOR_BLOCK_LIBRARY}
              canWrite={status.canWrite}
              onAddBlock={(type) => void handleAddBlock(type)}
            />
            <BlockNavigator
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={selectBlock}
            />
          </>
        }
        center={
          <>
            {status.loading ? <p className="ui-page-header__subtitle">Chargement des blocs…</p> : null}
            {status.error ? <p className="ui-alert ui-alert--error">{status.error}</p> : null}
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
              onDeleteBlock={(blockId) => void deleteBlock(blockId)}
              onQuickAddHero={() => void handleAddBlock('hero')}
              deviceMode={deviceMode}
            />
          </>
        }
        right={
          <PropertiesPanel
            selectedBlock={selectedBlock}
            canWrite={status.canWrite && !status.mutationBusy}
            onChangeProps={(blockId, nextProps) => void updateBlock(blockId, { propsJson: nextProps })}
          />
        }
      />
      <p className="ui-page-header__subtitle">
        Rendu landing : backend `landing-render` (source unique preview/export).
        {' '}
        <Link to={`/page-versions/${pageVersionId}/preview`} className="ui-link">
          Ouvrir la preview
        </Link>
      </p>
      <div className="editor-actions-panel">
        <Link
          to={`/page-versions/${pageVersionId}/preview`}
          className="ui-btn ui-btn--secondary ui-btn--sm"
        >
          Ouvrir la preview
        </Link>
        {versionStatus !== 'PUBLISHED' ? (
          <Button size="sm" onClick={() => void handlePublish()} disabled={publishing || !status.canWrite}>
            {publishing ? 'Publication…' : 'Publier cette version'}
          </Button>
        ) : null}
        {versionStatus === 'PUBLISHED' ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => void handleExport()}
            disabled={exporting || !status.canWrite}
          >
            {exporting ? 'Export…' : 'Exporter ZIP'}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
