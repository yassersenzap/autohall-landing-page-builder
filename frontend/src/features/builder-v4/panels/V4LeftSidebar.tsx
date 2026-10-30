import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { LayoutGrid, LayoutTemplate, Layers, Image } from 'lucide-react';
import { type LeftSidebarTab, normalizeSidebarTab } from '../lib/sidebar-tabs';
import { V4LayersPanel } from './V4LayersPanel';
import { V4TemplatesPanel } from './V4TemplatesPanel';
import { V4SectionsPanel } from './V4SectionsPanel';
import { V4AssetsPanel } from './V4AssetsPanel';
import { cn } from '@/lib/utils';

export type { LeftSidebarTab };

type V4LeftSidebarProps = {
  initialTab?: LeftSidebarTab;
  activeTab?: LeftSidebarTab;
  onTabChange?: (tab: LeftSidebarTab) => void;
};

const TABS: { value: LeftSidebarTab; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { value: 'sections',  label: 'SECTIONS / BLOCKS',  Icon: LayoutGrid },
  { value: 'templates', label: 'Templates', Icon: LayoutTemplate },
  { value: 'media',     label: 'Médias',    Icon: Image },
  { value: 'layers',    label: 'Calques',   Icon: Layers },
];

export function V4LeftSidebar({
  initialTab = 'sections',
  activeTab: controlledTab,
  onTabChange,
}: V4LeftSidebarProps) {
  const [internalTab, setInternalTab] = useState<LeftSidebarTab>(initialTab);
  const tab = normalizeSidebarTab(controlledTab ?? internalTab);
  const [glowTab, setGlowTab] = useState<string | null>(null);

  useEffect(() => {
    if (controlledTab) setInternalTab(normalizeSidebarTab(controlledTab));
  }, [controlledTab]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const tabValue = detail === 'blocks' ? 'sections' : normalizeSidebarTab(detail);
      setGlowTab(tabValue);
      const timer = setTimeout(() => setGlowTab(null), 2500);
      return () => clearTimeout(timer);
    };
    window.addEventListener('highlight-sidebar-tab', handler);
    return () => window.removeEventListener('highlight-sidebar-tab', handler);
  }, []);

  function handleTabChange(value: string) {
    const next = normalizeSidebarTab(value);
    setInternalTab(next);
    onTabChange?.(next);
  }

  return (
    <div className="v4-left-sidebar" data-testid="left-sidebar">
      <Tabs value={tab} onValueChange={handleTabChange} className="v4-left-sidebar__tabs">
        <TabsList className="v4-left-sidebar__tablist">
          {TABS.map(({ value, label, Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "v4-left-sidebar__tab",
                glowTab === value && "v4-left-sidebar__tab--glow"
              )}
              data-testid={`sidebar-tab-${value}`}
              title={label}
            >
              <Icon size={14} aria-hidden />
              <span className="v4-left-sidebar__tab-label">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>


        <TabsContent value="sections" className="v4-left-sidebar__content">
          <V4SectionsPanel />
        </TabsContent>
        <TabsContent value="templates" className="v4-left-sidebar__content">
          <V4TemplatesPanel />
        </TabsContent>
        <TabsContent value="media" className="v4-left-sidebar__content">
          <V4AssetsPanel />
        </TabsContent>
        <TabsContent value="layers" className="v4-left-sidebar__content">
          <V4LayersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
