import { useEffect, useMemo, useState } from 'react';
import type { Data } from '@puckeditor/core';
import {
  Blocks,
  ImagePlus,
  LayoutGrid,
  LayoutTemplate,
  ListChecks,
  Network,
} from 'lucide-react';
import { BLOCK_LIBRARY } from '../creative-engine/block-library';
import { SECTION_LIBRARY } from '../creative-engine/section-library';
import { STUDIO_V2_STARTERS } from '../creative-engine/starters';
import type { ReadinessIssue } from '../lib/readiness';
import { flattenDocumentStructure } from '../lib/walk-structure';
import { studioV2PuckConfig } from '../puck-config/index';
import { TEMPLATE_ID_ALIASES, type StudioV2TemplateId } from '../templates/index';
import { MediaLibraryGrid } from './MediaLibraryGrid';
import { TemplateConfirmDialog } from './TemplateConfirmDialog';

type SidebarTab = 'starters' | 'sections' | 'blocks' | 'media' | 'structure' | 'readiness';

type StudioV2CreativeSidebarProps = {
  pageVersionId: string;
  canWrite: boolean;
  documentData: Data;
  readinessIssues: ReadinessIssue[];
  hasExistingContent: boolean;
  initialTab?: SidebarTab;
  onApplyStarter: (starterId: StudioV2TemplateId) => void;
  onInsertSection: (sectionId: string) => void;
  onInsertBlock: (blockId: string) => void;
};

const SECTION_CATEGORIES = [
  { id: 'hero', label: 'Hero' },
  { id: 'conversion', label: 'Conversion' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'creative', label: 'Créatif' },
] as const;

const BLOCK_CATEGORIES = [
  { id: 'text', label: 'Texte' },
  { id: 'media', label: 'Média' },
  { id: 'layout', label: 'Mise en page' },
  { id: 'conversion', label: 'Conversion' },
  { id: 'marketing', label: 'Marketing' },
] as const;

export function StudioV2CreativeSidebar({
  pageVersionId,
  canWrite,
  documentData,
  readinessIssues,
  hasExistingContent,
  initialTab,
  onApplyStarter,
  onInsertSection,
  onInsertBlock,
}: StudioV2CreativeSidebarProps) {
  const [tab, setTab] = useState<SidebarTab>(initialTab ?? 'starters');

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);
  const [pendingStarter, setPendingStarter] = useState<StudioV2TemplateId | null>(null);
  const [sectionCategory, setSectionCategory] = useState<string>('hero');

  const critical = readinessIssues.filter((i) => i.level === 'critical');
  const warnings = readinessIssues.filter((i) => i.level === 'warning');
  const readinessStatus =
    critical.length > 0 ? 'blocking' : warnings.length > 0 ? 'incomplete' : 'ready';

  const structureNodes = useMemo(
    () => flattenDocumentStructure(documentData, studioV2PuckConfig),
    [documentData],
  );

  const pendingLabel = STUDIO_V2_STARTERS.find((s) => s.id === pendingStarter)?.label ?? '';

  function requestStarter(id: StudioV2TemplateId) {
    const resolved = (TEMPLATE_ID_ALIASES[id] ?? id) as StudioV2TemplateId;
    if (hasExistingContent) {
      setPendingStarter(resolved);
      return;
    }
    onApplyStarter(resolved);
  }

  const filteredSections = SECTION_LIBRARY.filter((s) => s.category === sectionCategory);

  return (
    <aside className="visual-studio-v2-sidepanel visual-studio-v2-sidepanel--creative">
      <div className="visual-studio-v2-sidepanel__tabs visual-studio-v2-sidepanel__tabs--6">
        {(
          [
            ['starters', 'Starters', LayoutTemplate],
            ['sections', 'Sections', LayoutGrid],
            ['blocks', 'Blocks', Blocks],
            ['media', 'Médias', ImagePlus],
            ['structure', 'Structure', Network],
            ['readiness', 'Checklist', ListChecks],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            className={tab === id ? 'is-active' : ''}
            onClick={() => setTab(id)}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            <span className="vs2-sidepanel-tab-label">{label}</span>
            {id === 'readiness' && critical.length > 0 ? (
              <span className="vs2-sidepanel-tab-alert" aria-hidden />
            ) : null}
          </button>
        ))}
      </div>

      <div className="visual-studio-v2-sidepanel__body">
        {tab === 'starters' ? (
          <ul className="vs2-starter-list">
            {STUDIO_V2_STARTERS.map((starter) => (
              <li key={starter.id}>
                <button
                  type="button"
                  className={`visual-studio-v2-template-card ${starter.previewTone}`}
                  disabled={!canWrite}
                  onClick={() => requestStarter(starter.id)}
                >
                  <span className="visual-studio-v2-template-card__use-case">{starter.category}</span>
                  <span className="font-medium">{starter.label}</span>
                  <span className="text-xs opacity-80">{starter.goal} — {starter.description}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'sections' ? (
          <div className="space-y-2">
            <div className="vs2-sidepanel-filters">
              {SECTION_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={sectionCategory === cat.id ? 'is-active' : ''}
                  onClick={() => setSectionCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <ul className="vs2-library-list">
              {filteredSections.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    className="vs2-library-card"
                    disabled={!canWrite}
                    onClick={() => onInsertSection(entry.id)}
                  >
                    <span className={`vs2-library-card__preview ${entry.previewClass}`} aria-hidden />
                    <span className="vs2-library-card__name">{entry.name}</span>
                    <span className="vs2-library-card__desc">{entry.description}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === 'blocks' ? (
          <ul className="vs2-library-list">
            {BLOCK_CATEGORIES.map((cat) => {
              const items = BLOCK_LIBRARY.filter((b) => b.category === cat.id);
              if (items.length === 0) return null;
              return (
                <li key={cat.id} className="vs2-library-group">
                  <p className="vs2-library-group__title">{cat.label}</p>
                  <ul>
                    {items.map((block) => (
                      <li key={block.id}>
                        <button
                          type="button"
                          className="vs2-library-card vs2-library-card--compact"
                          disabled={!canWrite}
                          onClick={() => onInsertBlock(block.id)}
                        >
                          <span className="vs2-library-card__name">{block.name}</span>
                          <span className="vs2-library-card__desc">{block.description}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        ) : null}

        {tab === 'media' ? (
          <div className="space-y-2">
            <p className="vs2-sidepanel-hint">
              Importez vos visuels, puis assignez-les via l&apos;inspecteur ou le bouton
              « Ajouter une image » sur le canvas.
            </p>
            <MediaLibraryGrid pageVersionId={pageVersionId} canWrite={canWrite} showDelete />
          </div>
        ) : null}

        {tab === 'structure' ? (
          <div className="vs2-structure-sidebar">
            {structureNodes.length === 0 ? (
              <p className="vs2-structure-panel__empty">Aucune section sur la page.</p>
            ) : (
              <>
                <p className="vs2-sidepanel-hint">
                  Vue d&apos;ensemble — sélectionnez un bloc dans le canvas pour l&apos;éditer.
                </p>
                <ul className="vs2-structure-panel__list">
                  {structureNodes.map((node) => (
                    <li key={`${node.zone}-${node.index}-${node.id}`}>
                      <span
                        className="vs2-structure-panel__item vs2-structure-panel__item--readonly"
                        style={{ paddingLeft: `${0.65 + node.depth * 0.85}rem` }}
                      >
                        {node.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : null}

        {tab === 'readiness' ? (
          <div className="space-y-3 text-xs">
            <p
              className={
                readinessStatus === 'ready'
                  ? 'vs2-readiness-badge vs2-readiness-badge--ready'
                  : readinessStatus === 'blocking'
                    ? 'vs2-readiness-badge vs2-readiness-badge--blocking'
                    : 'vs2-readiness-badge vs2-readiness-badge--incomplete'
              }
            >
              {readinessStatus === 'ready'
                ? 'Prêt pour export'
                : readinessStatus === 'blocking'
                  ? 'Bloquant — export impossible'
                  : 'À compléter'}
            </p>
            {critical.length > 0 ? (
              <div>
                <p className="mb-1 font-semibold text-red-500">Bloquant</p>
                <ul className="space-y-1">
                  {critical.map((issue) => (
                    <li key={issue.code} className="text-red-600 dark:text-red-400">
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {warnings.length > 0 ? (
              <div>
                <p className="mb-1 font-semibold text-amber-600">À vérifier</p>
                <ul className="space-y-1">
                  {warnings.map((issue) => (
                    <li key={issue.code} className="text-amber-700 dark:text-amber-300">
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <TemplateConfirmDialog
        open={pendingStarter !== null}
        templateLabel={pendingLabel}
        onCancel={() => setPendingStarter(null)}
        onConfirm={() => {
          if (pendingStarter) onApplyStarter(pendingStarter);
          setPendingStarter(null);
        }}
      />
    </aside>
  );
}
