import { useState } from 'react';
import { ImagePlus, LayoutTemplate, ListChecks, Layers } from 'lucide-react';
import type { ReadinessIssue } from '../lib/readiness';
import {
  STUDIO_V2_TEMPLATES,
  TEMPLATE_ID_ALIASES,
  type StudioV2TemplateId,
} from '../templates/index';
import { MediaLibraryGrid } from './MediaLibraryGrid';
import { TemplateConfirmDialog } from './TemplateConfirmDialog';

type StudioV2SidePanelProps = {
  pageVersionId: string;
  canWrite: boolean;
  readinessIssues: ReadinessIssue[];
  hasExistingContent: boolean;
  onApplyTemplate: (templateId: StudioV2TemplateId) => void;
};

export function StudioV2SidePanel({
  pageVersionId,
  canWrite,
  readinessIssues,
  hasExistingContent,
  onApplyTemplate,
}: StudioV2SidePanelProps) {
  const [tab, setTab] = useState<'templates' | 'media' | 'readiness'>('templates');
  const [pendingTemplate, setPendingTemplate] = useState<StudioV2TemplateId | null>(null);

  const critical = readinessIssues.filter((i) => i.level === 'critical');
  const warnings = readinessIssues.filter((i) => i.level === 'warning');

  const pendingLabel =
    STUDIO_V2_TEMPLATES.find((t) => t.id === pendingTemplate)?.label ?? '';

  function requestTemplate(id: StudioV2TemplateId) {
    const resolved = TEMPLATE_ID_ALIASES[id] ?? id;
    if (hasExistingContent) {
      setPendingTemplate(resolved);
      return;
    }
    onApplyTemplate(resolved);
  }

  return (
    <aside className="visual-studio-v2-sidepanel">
      <div className="visual-studio-v2-sidepanel__tabs">
        <button
          type="button"
          className={tab === 'templates' ? 'is-active' : ''}
          onClick={() => setTab('templates')}
        >
          <LayoutTemplate className="h-3.5 w-3.5" aria-hidden />
          Modèles
        </button>
        <button
          type="button"
          className={tab === 'media' ? 'is-active' : ''}
          onClick={() => setTab('media')}
        >
          <ImagePlus className="h-3.5 w-3.5" aria-hidden />
          Médias
        </button>
        <button
          type="button"
          className={tab === 'readiness' ? 'is-active' : ''}
          onClick={() => setTab('readiness')}
        >
          <ListChecks className="h-3.5 w-3.5" aria-hidden />
          Checklist
        </button>
      </div>

      <div className="visual-studio-v2-sidepanel__body">
        {tab === 'templates' ? (
          <ul className="space-y-2">
            {STUDIO_V2_TEMPLATES.map((template) => (
              <li key={template.id}>
                <button
                  type="button"
                  className="visual-studio-v2-template-card"
                  disabled={!canWrite}
                  onClick={() => requestTemplate(template.id)}
                >
                  <span className="visual-studio-v2-template-card__use-case">{template.goal ?? template.category}</span>
                  <span className="font-medium">{template.label}</span>
                  <span className="text-xs opacity-80">{template.description}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'media' ? (
          <div className="space-y-2">
            <p className="vs2-sidepanel-hint">
              Importez vos visuels ici, puis sélectionnez-les dans l&apos;inspecteur d&apos;un bloc
              Hero, Offre ou Image.
            </p>
            <MediaLibraryGrid pageVersionId={pageVersionId} canWrite={canWrite} showDelete />
          </div>
        ) : null}

        {tab === 'readiness' ? (
          <div className="space-y-3 text-xs">
            {critical.length === 0 && warnings.length === 0 ? (
              <p className="text-emerald-600 dark:text-emerald-400">Page prête pour export.</p>
            ) : null}
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

      <div className="visual-studio-v2-sidepanel__footer">
        <p className="vs2-sidepanel-hint flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 opacity-60" aria-hidden />
          Structure : panneau gauche Puck
        </p>
      </div>

      <TemplateConfirmDialog
        open={pendingTemplate !== null}
        templateLabel={pendingLabel}
        onCancel={() => setPendingTemplate(null)}
        onConfirm={() => {
          if (pendingTemplate) onApplyTemplate(pendingTemplate);
          setPendingTemplate(null);
        }}
      />
    </aside>
  );
}
