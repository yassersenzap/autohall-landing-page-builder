import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  DownloadCloud,
  Eye,
  Loader2,
  Monitor,
  Redo2,
  Save,
  Settings,
  Smartphone,
  Undo2,
} from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { BuilderDeviceMode } from '@/features/builder-engine/lib/block-design-props';
import { useBuilderDocumentStore } from '@/features/builder-engine/store/builder-document.store';

export type StudioV3SaveStatus = 'saved' | 'dirty' | 'saving' | 'loading';

type StudioTopBarProps = {
  title?: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  deviceMode: BuilderDeviceMode;
  saveStatus: StudioV3SaveStatus;
  documentLoading?: boolean;
  onDeviceModeChange: (mode: BuilderDeviceMode) => void;
  onSave: () => void;
  onPreview: () => void;
  onExport?: () => void;
  exportLoading?: boolean;
  onOpenPageSettings?: () => void;
};

function SaveStatusBadge({ status }: { status: StudioV3SaveStatus }) {
  if (status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[0.6875rem] text-neutral-400">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Chargement du document…
      </span>
    );
  }
  if (status === 'saving') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[0.6875rem] text-neutral-400">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
        Enregistrement…
      </span>
    );
  }
  if (status === 'dirty') {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[0.6875rem] text-amber-200">
        Modifications non enregistrées
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[0.6875rem] text-emerald-200">
      <Check className="h-3 w-3" aria-hidden />
      Enregistré
    </span>
  );
}

export function StudioTopBar({
  title = 'Auto Hall — Landing Studio',
  subtitle,
  backTo = '/campaigns',
  backLabel = 'Retour aux campagnes',
  deviceMode,
  saveStatus,
  onDeviceModeChange,
  onSave,
  onPreview,
  onExport,
  exportLoading = false,
  onOpenPageSettings,
  documentLoading = false,
}: StudioTopBarProps) {
  const actionsDisabled = documentLoading || saveStatus === 'loading' || saveStatus === 'saving';
  const canUndo = useBuilderDocumentStore((s) => s.historyPast.length > 0);
  const canRedo = useBuilderDocumentStore((s) => s.historyFuture.length > 0);
  const undo = useBuilderDocumentStore((s) => s.undo);
  const redo = useBuilderDocumentStore((s) => s.redo);

  return (
    <header
      className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-neutral-800 bg-neutral-950 px-4"
      data-builder-v3-topbar
    >
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to={backTo}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-600 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {backLabel}
        </Link>
        <div className="min-w-0 border-l border-neutral-800 pl-3">
          <p className="truncate text-sm font-semibold tracking-tight text-neutral-100">{title}</p>
          {subtitle ? (
            <p className="truncate text-xs text-neutral-500">{subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div
          className="flex rounded-lg border border-neutral-800 bg-neutral-900/80 p-0.5"
          role="group"
          aria-label="Historique"
        >
          <button
            type="button"
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors',
              canUndo && !actionsDisabled
                ? 'text-neutral-200 hover:bg-neutral-800'
                : 'cursor-not-allowed text-neutral-600',
            )}
            disabled={!canUndo || actionsDisabled}
            onClick={() => undo()}
            title="Annuler (Ctrl+Z)"
            aria-label="Annuler"
            data-testid="studio-undo"
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden />
            Annuler
          </button>
          <button
            type="button"
            className={cn(
              'inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium transition-colors',
              canRedo && !actionsDisabled
                ? 'text-neutral-200 hover:bg-neutral-800'
                : 'cursor-not-allowed text-neutral-600',
            )}
            disabled={!canRedo || actionsDisabled}
            onClick={() => redo()}
            title="Rétablir (Ctrl+Shift+Z)"
            aria-label="Rétablir"
            data-testid="studio-redo"
          >
            <Redo2 className="h-3.5 w-3.5" aria-hidden />
            Rétablir
          </button>
        </div>

        <div
          className="flex rounded-lg border border-neutral-800 bg-neutral-900/80 p-0.5"
          role="group"
          aria-label="Viewport"
        >
          <button
            type="button"
            className={cn(
              'inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors',
              deviceMode === 'desktop'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300',
            )}
            onClick={() => onDeviceModeChange('desktop')}
            title="Desktop"
            aria-pressed={deviceMode === 'desktop'}
          >
            <Monitor className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={cn(
              'inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors',
              deviceMode === 'mobile'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-500 hover:text-neutral-300',
            )}
            onClick={() => onDeviceModeChange('mobile')}
            title="Mobile"
            aria-pressed={deviceMode === 'mobile'}
          >
            <Smartphone className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <SaveStatusBadge status={documentLoading ? 'loading' : saveStatus} />

        {onOpenPageSettings ? (
          <ShadButton
            type="button"
            size="sm"
            variant="secondary"
            className="border-neutral-700 bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
            disabled={actionsDisabled}
            onClick={onOpenPageSettings}
            title="Paramètres de la page"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden />
            Paramètres
          </ShadButton>
        ) : null}

        <ShadButton
          type="button"
          size="sm"
          variant="secondary"
          className="border-neutral-700 bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
          disabled={actionsDisabled}
          onClick={onSave}
        >
          <Save className="h-3.5 w-3.5" aria-hidden />
          Sauvegarder
        </ShadButton>

        {onExport ? (
          <ShadButton
            type="button"
            size="sm"
            variant="secondary"
            className="border-neutral-700 bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
            disabled={actionsDisabled || exportLoading}
            onClick={onExport}
          >
            {exportLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <DownloadCloud className="h-3.5 w-3.5" aria-hidden />
            )}
            Exporter (ZIP)
          </ShadButton>
        ) : null}

        <ShadButton
          type="button"
          size="sm"
          className="bg-blue-600 text-white hover:bg-blue-500"
          disabled={actionsDisabled}
          onClick={onPreview}
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
          Aperçu
        </ShadButton>
      </div>
    </header>
  );
}
