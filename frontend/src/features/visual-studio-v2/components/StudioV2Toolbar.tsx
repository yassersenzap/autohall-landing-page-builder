import {
  ArrowLeft,
  Download,
  Eye,
  Monitor,
  Save,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShadButton } from '@/components/ui/primitives';
import type { StudioV2SaveStatus } from '../types';

export type StudioV2Viewport = 'desktop' | 'mobile';
export type StudioV2Zoom = 'fit' | '80' | '100';

type StudioV2ToolbarProps = {
  backTo: string;
  backLabel: string;
  backState?: Record<string, unknown>;
  pageTitle?: string;
  versionLabel?: string;
  saveStatus: StudioV2SaveStatus;
  canWrite: boolean;
  viewport: StudioV2Viewport;
  zoom: StudioV2Zoom;
  onViewportChange: (viewport: StudioV2Viewport) => void;
  onZoomChange: (zoom: StudioV2Zoom) => void;
  onSave: () => void;
  onPreview: () => void;
  onExport: () => void;
  exportDisabled?: boolean;
};

function statusLabel(status: StudioV2SaveStatus): string {
  switch (status) {
    case 'loading':
      return 'Chargement…';
    case 'saving':
      return 'Enregistrement…';
    case 'dirty':
      return 'Modifications non enregistrées';
    case 'error':
      return 'Erreur';
    default:
      return 'Enregistré';
  }
}

export function StudioV2Toolbar({
  backTo,
  backLabel,
  backState,
  pageTitle,
  versionLabel,
  saveStatus,
  canWrite,
  viewport,
  zoom,
  onViewportChange,
  onZoomChange,
  onSave,
  onPreview,
  onExport,
  exportDisabled,
}: StudioV2ToolbarProps) {
  return (
    <header className="visual-studio-v2-toolbar">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to={backTo}
          state={backState}
          className="visual-studio-v2-toolbar__link inline-flex shrink-0 items-center gap-1 text-sm"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {backLabel}
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Auto Hall Landing Studio</p>
          {versionLabel || pageTitle ? (
            <p className="truncate text-xs visual-studio-v2-toolbar__hint">
              {[versionLabel, pageTitle].filter(Boolean).join(' — ')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="visual-studio-v2-toolbar__group" role="group" aria-label="Appareil">
          <button
            type="button"
            className={`visual-studio-v2-toolbar__chip ${viewport === 'desktop' ? 'is-active' : ''}`}
            onClick={() => onViewportChange('desktop')}
            title="Desktop"
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className={`visual-studio-v2-toolbar__chip ${viewport === 'mobile' ? 'is-active' : ''}`}
            onClick={() => onViewportChange('mobile')}
            title="Mobile"
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <select
          className="visual-studio-v2-toolbar__select"
          value={zoom}
          onChange={(e) => onZoomChange(e.target.value as StudioV2Zoom)}
          aria-label="Zoom canvas"
        >
          <option value="fit">Fit</option>
          <option value="80">80%</option>
          <option value="100">100%</option>
        </select>

        <span
          className={`text-xs ${saveStatus === 'dirty' ? 'visual-studio-v2-toolbar__dirty' : 'visual-studio-v2-toolbar__hint'}`}
        >
          {statusLabel(saveStatus)}
        </span>

        {canWrite ? (
          <ShadButton
            type="button"
            size="sm"
            variant="secondary"
            disabled={saveStatus === 'saving' || saveStatus === 'loading'}
            onClick={onSave}
          >
            <Save className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Enregistrer
          </ShadButton>
        ) : null}

        <ShadButton type="button" size="sm" variant="secondary" onClick={onPreview}>
          <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Aperçu
        </ShadButton>

        {canWrite ? (
          <ShadButton
            type="button"
            size="sm"
            disabled={exportDisabled || saveStatus === 'saving'}
            onClick={onExport}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Export ZIP
          </ShadButton>
        ) : null}
      </div>
    </header>
  );
}
