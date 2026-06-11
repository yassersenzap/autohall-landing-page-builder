import { useState } from 'react';
import { countCatalogBlocks } from '@/features/builder-engine/foundation/builder-catalog';
import { getBasicBlockCatalog } from '@/features/builder-engine/foundation/catalog-tiers';
import { Separator } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
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
  const basicCount = getBasicBlockCatalog().length;
  const activeMode = STUDIO_SIDEBAR_MODES.find((m) => m.id === mode);

  return (
    <aside
      className="flex h-full w-[300px] shrink-0 border-r border-neutral-800 bg-neutral-950"
      data-builder-v3-left-sidebar
      data-studio-sidebar-mode={mode}
    >
      <nav
        className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-neutral-800 py-3"
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
                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/40'
                  : 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </button>
          );
        })}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-neutral-800 px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Studio</p>
          <p className="mt-0.5 text-sm font-medium text-neutral-200">
            {activeMode?.shortLabel ?? 'Blocs'}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          {mode === 'blocks' && <BlocksCatalogPanel />}
          {mode === 'layers' && <LayersPanel className="min-h-0 flex-1" />}
          {mode === 'assets' && <AssetsPanel />}
          {mode === 'templates' && <TemplatesPanel />}
          {mode === 'page' && <PagePanel onOpenPageSettings={onOpenPageSettings} />}
        </div>

        <Separator className="bg-neutral-800" />
        <div className="px-3 py-2">
          <p className="text-[0.625rem] text-neutral-600">
            {countCatalogBlocks()} blocs · {basicCount} atomiques
          </p>
        </div>
      </div>
    </aside>
  );
}
