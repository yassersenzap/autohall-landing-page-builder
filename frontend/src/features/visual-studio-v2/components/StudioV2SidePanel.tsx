import { useCallback, useState } from 'react';
import { ImagePlus, LayoutTemplate, ListChecks } from 'lucide-react';
import { usePageAssets } from '@/features/builder-engine/hooks/use-page-assets';
import { AssetImage } from '@/features/builder-engine/components/media/AssetImage';
import { uploadPageVersionAsset } from '@/lib/page-assets-api';
import type { ReadinessIssue } from '../lib/readiness';
import { STUDIO_V2_TEMPLATES, type StudioV2TemplateId } from '../templates/index';

type StudioV2SidePanelProps = {
  pageVersionId: string;
  canWrite: boolean;
  readinessIssues: ReadinessIssue[];
  onApplyTemplate: (templateId: StudioV2TemplateId) => void;
};

export function StudioV2SidePanel({
  pageVersionId,
  canWrite,
  readinessIssues,
  onApplyTemplate,
}: StudioV2SidePanelProps) {
  const [tab, setTab] = useState<'templates' | 'media' | 'readiness'>('templates');
  const { assets, reload } = usePageAssets(pageVersionId);

  const handleUpload = useCallback(
    async (file: File) => {
      await uploadPageVersionAsset(pageVersionId, file);
      await reload();
    },
    [pageVersionId, reload],
  );

  const critical = readinessIssues.filter((i) => i.level === 'critical');
  const warnings = readinessIssues.filter((i) => i.level === 'warning');

  return (
    <aside className="visual-studio-v2-sidepanel">
      <div className="visual-studio-v2-sidepanel__tabs">
        <button
          type="button"
          className={tab === 'templates' ? 'is-active' : ''}
          onClick={() => setTab('templates')}
        >
          <LayoutTemplate className="h-3.5 w-3.5" aria-hidden />
          Templates
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
                  onClick={() => onApplyTemplate(template.id)}
                >
                  <span className="font-medium">{template.label}</span>
                  <span className="text-xs opacity-80">{template.description}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === 'media' ? (
          <div className="space-y-3">
            {canWrite ? (
              <label className="visual-studio-v2-upload">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleUpload(file);
                    e.target.value = '';
                  }}
                />
                <ImagePlus className="h-4 w-4" aria-hidden />
                Uploader une image
              </label>
            ) : null}
            <ul className="grid grid-cols-2 gap-2">
              {assets.map((asset) => (
                <li key={asset.id} className="visual-studio-v2-media-thumb">
                  <AssetImage
                    assetId={asset.id}
                    alt={asset.originalName}
                    className="h-full w-full object-cover"
                    loadingClassName="h-full w-full"
                  />
                  <span className="visual-studio-v2-media-thumb__label">{asset.originalName}</span>
                  <span className="visual-studio-v2-media-thumb__warn">Vérifier alt</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {tab === 'readiness' ? (
          <div className="space-y-3 text-xs">
            {critical.length === 0 && warnings.length === 0 ? (
              <p className="text-emerald-400">Page prête pour export.</p>
            ) : null}
            {critical.length > 0 ? (
              <div>
                <p className="mb-1 font-semibold text-red-400">Bloquant</p>
                <ul className="space-y-1">
                  {critical.map((issue) => (
                    <li key={issue.code} className="text-red-300">
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {warnings.length > 0 ? (
              <div>
                <p className="mb-1 font-semibold text-amber-400">Avertissements</p>
                <ul className="space-y-1">
                  {warnings.map((issue) => (
                    <li key={issue.code} className="text-amber-200/90">
                      {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
