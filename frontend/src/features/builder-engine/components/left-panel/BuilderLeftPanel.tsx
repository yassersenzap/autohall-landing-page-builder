import { useState } from 'react';
import { Blocks, Image, Layers, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlocksTab } from './BlocksTab';
import { MediaLibraryPanel } from './MediaLibraryPanel';
import { NavigatorTab } from './NavigatorTab';
import { SectionsTab } from './SectionsTab';

export type LeftPanelTab = 'blocks' | 'sections' | 'media' | 'navigator';

const TABS: { id: LeftPanelTab; label: string; icon: typeof Blocks }[] = [
  { id: 'blocks', label: 'Blocs', icon: Blocks },
  { id: 'sections', label: 'Modèles', icon: LayoutTemplate },
  { id: 'media', label: 'Médias', icon: Image },
  { id: 'navigator', label: 'Plan', icon: Layers },
];

type BuilderLeftPanelProps = {
  activeTab?: LeftPanelTab;
  onTabChange?: (tab: LeftPanelTab) => void;
};

export function BuilderLeftPanel({
  activeTab: controlledTab,
  onTabChange,
}: BuilderLeftPanelProps) {
  const [internalTab, setInternalTab] = useState<LeftPanelTab>('blocks');
  const tab = controlledTab ?? internalTab;

  function setTab(next: LeftPanelTab) {
    setInternalTab(next);
    onTabChange?.(next);
  }

  return (
    <aside className="builder-panel builder-panel--left flex h-full min-h-0 w-full flex-col border-b border-border bg-builder lg:max-h-none lg:border-b-0 lg:border-r">
      <header className="shrink-0 border-b border-border px-2 pt-2">
        <p className="px-1 text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
          Éditeur
        </p>
        <nav
          className="mt-2 grid grid-cols-4 gap-0.5"
          aria-label="Panneau gauche"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-md px-1 py-1.5 text-[0.6rem] font-medium transition-colors',
                tab === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
              )}
              aria-current={tab === id ? 'page' : undefined}
              onClick={() => setTab(id)}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </button>
          ))}
        </nav>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'blocks' ? <BlocksTab /> : null}
        {tab === 'sections' ? <SectionsTab /> : null}
        {tab === 'media' ? <MediaLibraryPanel /> : null}
        {tab === 'navigator' ? <NavigatorTab /> : null}
      </div>
    </aside>
  );
}
