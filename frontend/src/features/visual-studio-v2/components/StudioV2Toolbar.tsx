import {
  ArrowLeft,
  Check,
  Download,
  Eye,
  Loader2,
  Monitor,
  Save,
  Smartphone,
} from 'lucide-react';
import { Link } from 'react-router-dom';
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

function SaveStatusPill({ status }: { status: StudioV2SaveStatus }) {
  if (status === 'loading' || status === 'saving') {
    return (
      <span className="ah-status-dirty">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        {status === 'saving' ? 'Enregistrement…' : 'Chargement…'}
      </span>
    );
  }
  if (status === 'dirty') {
    return <span className="ah-status-dirty">Modifications non enregistrées</span>;
  }
  if (status === 'error') {
    return <span className="ah-status-dirty">Erreur</span>;
  }
  return (
    <span className="ah-status-saved">
      <Check className="h-3 w-3" aria-hidden />
      Enregistré
    </span>
  );
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
    <header className="visual-studio-v2-toolbar ah-glass">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to={backTo}
          state={backState}
          className="ah-editor-btn visual-studio-v2-toolbar__link !gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {backLabel}
        </Link>
        <div className="min-w-0 border-l border-[var(--studio-editor-border)] pl-3">
          <p className="truncate text-sm font-semibold tracking-tight text-[var(--studio-editor-text)]">
            Auto Hall Landing Studio
          </p>
          {versionLabel || pageTitle ? (
            <p className="truncate text-xs text-[var(--studio-editor-text-soft)]">
              {[versionLabel, pageTitle].filter(Boolean).join(' — ')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="visual-studio-v2-toolbar__group" role="group" aria-label="Appareil">
          <button
            type="button"
            className={`visual-studio-v2-toolbar__chip ah-editor-btn !rounded-none !border-0 ${viewport === 'desktop' ? 'ah-editor-btn--active' : ''}`}
            onClick={() => onViewportChange('desktop')}
            title="Desktop"
          >
            <Monitor className="h-3.5 w-3.5" aria-hidden />
          </button>
          <button
            type="button"
            className={`visual-studio-v2-toolbar__chip ah-editor-btn !rounded-none !border-0 ${viewport === 'mobile' ? 'ah-editor-btn--active' : ''}`}
            onClick={() => onViewportChange('mobile')}
            title="Mobile"
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <select
          className="visual-studio-v2-toolbar__select ah-input !min-h-[1.875rem] !w-auto !py-0 !text-xs"
          value={zoom}
          onChange={(e) => onZoomChange(e.target.value as StudioV2Zoom)}
          aria-label="Zoom canvas"
        >
          <option value="fit">Fit</option>
          <option value="80">80%</option>
          <option value="100">100%</option>
        </select>

        <SaveStatusPill status={saveStatus} />

        {canWrite ? (
          <button
            type="button"
            className="ah-editor-btn"
            disabled={saveStatus === 'saving' || saveStatus === 'loading'}
            onClick={onSave}
          >
            <Save className="h-3.5 w-3.5" aria-hidden />
            Enregistrer
          </button>
        ) : null}

        <button type="button" className="ah-editor-btn ah-editor-btn--primary" onClick={onPreview}>
          <Eye className="h-3.5 w-3.5" aria-hidden />
          Aperçu
        </button>

        {canWrite ? (
          <button
            type="button"
            className="ah-editor-btn ah-editor-btn--cta"
            disabled={exportDisabled || saveStatus === 'saving'}
            onClick={onExport}
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Export ZIP
          </button>
        ) : null}
      </div>
    </header>
  );
}
