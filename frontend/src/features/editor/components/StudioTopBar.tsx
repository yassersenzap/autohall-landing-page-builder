import type { ReactNode } from 'react';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Monitor,
  RefreshCw,
  Save,
  Smartphone,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, ShadButton, ToggleGroup, buttonVariants } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import type { EditorDeviceMode } from '../types/editor.types';
import { EditorThemeToggle } from './EditorThemeToggle';

type StudioTopBarProps = {
  campaignName?: string;
  landingTitle?: string;
  versionLabel: string;
  status: string | undefined;
  canWrite: boolean;
  publishing: boolean;
  exporting: boolean;
  deviceMode: EditorDeviceMode;
  previewTo: string;
  previewState: unknown;
  backTo: string;
  backLabel: string;
  backState?: unknown;
  onDeviceModeChange: (mode: EditorDeviceMode) => void;
  onRefresh: () => void;
  onPublish: () => void;
  onExport: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  /** Contrôles workspace (panneaux, focus) — injectés par le builder. */
  workspaceToolbar?: ReactNode;
};

function statusVariant(status: string | undefined): 'default' | 'secondary' | 'muted' {
  if (status === 'PUBLISHED') return 'default';
  if (status === 'DRAFT') return 'secondary';
  return 'muted';
}

export function StudioTopBar({
  campaignName,
  landingTitle,
  versionLabel,
  status,
  canWrite,
  publishing,
  exporting,
  deviceMode,
  previewTo,
  previewState,
  backTo,
  backLabel,
  backState,
  onDeviceModeChange,
  onRefresh,
  onPublish,
  onExport,
  onSave,
  isSaving = false,
  workspaceToolbar,
}: StudioTopBarProps) {
  const breadcrumb = [campaignName, landingTitle].filter(Boolean);

  return (
    <header className="z-20 grid h-[3.25rem] shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border bg-builder/95 px-3 backdrop-blur-xl sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          to={backTo}
          state={backState}
          title={backLabel}
          className={cn(
            'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm font-medium',
            'text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{backLabel}</span>
        </Link>
        <div className="hidden min-w-0 items-center gap-1 text-sm text-muted-foreground md:flex">
          {breadcrumb.map((part, i) => (
            <span key={`${part}-${i}`} className="flex min-w-0 items-center gap-1">
              {i > 0 ? <span className="opacity-40">/</span> : null}
              <span className="truncate">{part}</span>
            </span>
          ))}
          {breadcrumb.length > 0 ? <span className="opacity-40">/</span> : null}
          <span className="truncate font-semibold text-foreground">{versionLabel}</span>
        </div>
        {status ? (
          <Badge variant={statusVariant(status)} className="hidden shrink-0 sm:inline-flex">
            {status}
          </Badge>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <ToggleGroup
          value={deviceMode}
          onChange={onDeviceModeChange}
          ariaLabel="Viewport"
          items={[
            { value: 'desktop', label: 'Desktop', icon: <Monitor className="h-3.5 w-3.5" /> },
            { value: 'mobile', label: 'Mobile', icon: <Smartphone className="h-3.5 w-3.5" /> },
          ]}
        />
        {workspaceToolbar}
      </div>

      <div className="flex items-center justify-end gap-1.5">
        {canWrite && onSave ? (
          <ShadButton
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={onSave}
            className="font-semibold"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
          </ShadButton>
        ) : null}
        <ShadButton type="button" variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={onRefresh}>
          <RefreshCw className="h-3.5 w-3.5" />
          Recharger
        </ShadButton>
        <ShadButton type="button" variant="ghost" size="icon" className="sm:hidden" onClick={onRefresh} aria-label="Recharger">
          <RefreshCw className="h-4 w-4" />
        </ShadButton>
        <Link
          to={previewTo}
          state={previewState}
          className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }))}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Aperçu
        </Link>
        {canWrite && status !== 'PUBLISHED' ? (
          <ShadButton size="sm" disabled={publishing} onClick={onPublish}>
            <Upload className="h-3.5 w-3.5" />
            {publishing ? 'Publication…' : 'Publier'}
          </ShadButton>
        ) : null}
        {canWrite && status === 'PUBLISHED' ? (
          <ShadButton size="sm" disabled={exporting} onClick={onExport}>
            <Download className="h-3.5 w-3.5" />
            {exporting ? 'Export…' : 'ZIP'}
          </ShadButton>
        ) : null}
        <EditorThemeToggle />
      </div>
    </header>
  );
}
