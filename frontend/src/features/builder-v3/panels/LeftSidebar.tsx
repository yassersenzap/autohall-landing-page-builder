import { useState } from 'react';
import { countArchivedCatalogBlocks, countCatalogBlocks } from '@/features/builder-engine/foundation/builder-catalog';
import { Separator } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { STUDIO_PANEL_BODY_SLOT_CLASS } from '../layout/studio-panel-scroll';
import {
  STUDIO_SIDEBAR_MODES,
  type StudioSidebarMode,
} from '../layout/studio-sidebar-modes';
import { AssetsPanel } from './AssetsPanel';
import { BlocksCatalogPanel } from './BlocksCatalogPanel';
import { LayersPanel } from './LayersPanel';
import { PagePanel } from './PagePanel';
import { TemplatesPanel } from './TemplatesPanel';

type LeftSidebarProps = {
  onOpenPageSettings?: () => void;
};

export function LeftSidebar({ onOpenPageSettings }: LeftSidebarProps) {
  const [mode, setMode] = useState<StudioSidebarMode>('blocks');
  const archivedCount = countArchivedCatalogBlocks();
  const activeMode = STUDIO_SIDEBAR_MODES.find((m) => m.id === mode);

  return (
    <aside
      className="flex h-full min-h-0 w-[300px] shrink-0 border-r border-zinc-800/80 bg-zinc-950"
      data-builder-v3-left-sidebar
      data-studio-sidebar-mode={mode}
    >
      <nav
        className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-zinc-800/80 py-3"
        aria-label="Modes studio"
        data-testid="studio-sidebar-modes"
      >
        {STUDIO_SIDEBAR_MODES.map((item) => {
          const Icon = item.icon;
          const isActive = mode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`studio-sidebar-mode-${item.id}`}
              onClick={() => setMode(item.id)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150',
                isActive
                  ? 'bg-zinc-900 text-zinc-100 ring-1 ring-zinc-700/80'
                  : 'text-zinc-500 hover:bg-zinc-900/60 hover:text-zinc-300',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </button>
          );
        })}
      </nav>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-zinc-950">
        <div className="shrink-0 border-b border-zinc-800/80 px-3 py-2.5">
          <p className="text-sm font-medium text-zinc-200">{activeMode?.shortLabel ?? 'Blocs'}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{activeMode?.label ?? 'Catalogue'}</p>
        </div>

        <div className={STUDIO_PANEL_BODY_SLOT_CLASS} data-testid="studio-left-panel-body">
          {mode === 'blocks' && <BlocksCatalogPanel />}
          {mode === 'layers' && <LayersPanel />}
          {mode === 'assets' && <AssetsPanel />}
          {mode === 'templates' && <TemplatesPanel />}
          {mode === 'page' && <PagePanel onOpenPageSettings={onOpenPageSettings} />}
        </div>

        <Separator className="shrink-0 bg-zinc-800/80" />
        <div className="shrink-0 px-3 py-2">
          <p className="text-xs text-zinc-600">
            {countCatalogBlocks()} actif · {archivedCount} archivés
          </p>
        </div>
      </div>
    </aside>
  );
}
