import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Monitor, Tablet, Smartphone, ChevronDown, LayoutDashboard, Layers, Users, Settings } from 'lucide-react';
import { Toaster } from '@/components/ui/shadcn/sonner';
import { BGPattern } from '@/components/ui/BGPattern';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/shadcn/dropdown-menu';
import { CanvasLayer } from '../canvas/CanvasLayer';
import { useCompactInspector } from '../hooks/use-compact-inspector';
import { useBuilderV4Shortcuts } from '../hooks/use-builder-v4-shortcuts';
import { useDocumentAutosave } from '../hooks/use-document-autosave';
import { useInspectorPanelResize } from '../hooks/use-inspector-panel-resize';
import { V4InspectorPanel } from '../panels/V4InspectorPanel';
import { V4InspectorDrawer } from '../panels/V4InspectorDrawer';
import { PageSettingsDrawer } from '../panels/PageSettingsDrawer';
import { V4LeftSidebar } from '../panels/V4LeftSidebar';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { V4TopbarActions } from './V4TopbarActions';
import { useBuilderV4Store } from '../store/document.store';
import { isDocumentEmpty } from '../lib/document-lifecycle';
import type { DeviceMode } from '../types/nodes.types';
import '../styles/builder-v4.css';
import '../styles/campaign-autohall.css';
import '../styles/blocks-panel.css';
import '../styles/media-panel.css';
import '../styles/inline-editing.css';
import '../styles/layers-panel.css';
import '../styles/canvas-interaction.css';
import '../styles/inspector-v2.css';
import '../styles/blank-canvas.css';
import '../styles/canvas-pro.css';
import '../styles/hero-form-renderer.css';
import '../styles/panels-v2.css';
import '../styles/builder-ux.css';
import '../styles/lp-blocks.css';
import '../styles/tactical-flash-campaign.css';
import '../styles/multi-step-test-drive.css';
import { cn } from '@/lib/utils';

const DEVICE_ICONS: Record<DeviceMode, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  desktop: Monitor,
  tablet:  Tablet,
  mobile:  Smartphone,
};

const DEVICE_LABELS: Record<DeviceMode, string> = {
  desktop: 'Desktop',
  tablet:  'Tablet',
  mobile:  'Mobile',
};

export function V4Workspace() {
  const deviceMode        = useBuilderV4Store((s) => s.deviceMode);
  const leftPanelOpen     = useBuilderV4Store((s) => s.leftPanelOpen);
  const rightPanelOpen    = useBuilderV4Store((s) => s.rightPanelOpen);
  const leftSidebarTab    = useBuilderV4Store((s) => s.leftSidebarTab);
  const pageTitle         = useBuilderV4Store((s) => s.document.meta.title);
  const document          = useBuilderV4Store((s) => s.document);
  const selectedNodeId    = useBuilderV4Store((s) => s.selectedNodeId);
  const setDeviceMode     = useBuilderV4Store((s) => s.setDeviceMode);
  const setRightPanelOpen = useBuilderV4Store((s) => s.setRightPanelOpen);
  const setLeftSidebarTab = useBuilderV4Store((s) => s.setLeftSidebarTab);
  const campaignId        = useBuilderV4Store((s) => s.campaignId);

  // ── Right panel visibility logic ─────────────────────────────
  const isEmpty = isDocumentEmpty(document);
  const forceHideRight = isEmpty && !selectedNodeId;

  useBuilderV4Shortcuts();
  useDocumentAutosave();
  const { width: inspectorWidth, onResizePointerDown } = useInspectorPanelResize();
  const compactInspector = useCompactInspector();
  const [compactInspectorReady, setCompactInspectorReady] = useState(false);
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);

  useEffect(() => {
    if (compactInspector && !compactInspectorReady) {
      setRightPanelOpen(false);
      setCompactInspectorReady(true);
    }
  }, [compactInspector, compactInspectorReady, setRightPanelOpen]);

  const showRight = !forceHideRight && rightPanelOpen;

  return (
    <div className="v4-workspace" data-testid="builder-v4-workspace">
      <Toaster theme="dark" position="bottom-right" richColors />
      <BGPattern variant="dots" mask="fade-edges" size={24} fill="rgba(255,255,255,0.07)" />

      {/* ═══════════════════════════════════════════════════════════
          TOPBAR — enterprise Shadcn/Radix standard
          ═══════════════════════════════════════════════════════════ */}
      <header
        className={cn(
          'v4-workspace__topbar',
          'w-full h-14 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800/80 px-4 flex items-center justify-between z-50 select-none'
        )}
        data-testid="topbar"
      >

        {/* LEFT — identity breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center h-full pl-2 select-none shrink-0">
            {/* Badge de marque — unifié logo + nom + tag studio */}
            <div className="flex items-center gap-2 px-2 py-1 bg-zinc-950 border border-zinc-800/80 rounded-lg shadow-sm">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] font-semibold text-zinc-200 tracking-tight font-sans">AUTO HALL</span>
              <span className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 rounded px-1 py-0.5 font-mono">STUDIO</span>
            </div>
          </div>

          {/* Contextual navigation switcher */}
          <div className="v4-topbar-nav__divider" aria-hidden />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="px-2.5 py-1.5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/60 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                data-testid="topbar-nav-switcher"
              >
                Espace Campagnes
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={8}
              className="min-w-65 bg-zinc-950 border border-zinc-800 rounded-xl p-1.5 shadow-2xl space-y-0.5 z-50 animate-in fade-in-50 slide-in-from-top-1"
            >
              <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:bg-zinc-800/70 focus:text-white cursor-pointer gap-2.5">
                <Link to="/dashboard">
                  <LayoutDashboard className="w-3.5 h-3.5 text-zinc-500" aria-hidden />
                  Tableau de Bord (Analytics &amp; KPI)
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 text-xs text-white bg-zinc-800/60 focus:bg-zinc-800 cursor-pointer gap-2.5">
                <Link to={campaignId ? `/campaigns/${campaignId}/landing-pages` : '/campaigns'}>
                  <Layers className="w-3.5 h-3.5 text-orange-400" aria-hidden />
                  Gestion des Campagnes (Builder)
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" aria-hidden />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-lg px-2.5 py-2 text-xs text-zinc-300 focus:bg-zinc-800/70 focus:text-white cursor-pointer gap-2.5">
                <Link to="/leads">
                  <Users className="w-3.5 h-3.5 text-zinc-500" aria-hidden />
                  Suivi des Leads &amp; Hub CRM
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Page title chip */}
          {pageTitle && (
            <span className="v4-topbar-page-chip" title={pageTitle}>
              {pageTitle}
            </span>
          )}

          {/* Save status LED badge — masqué quand le canvas est vide */}
          {!isEmpty && <SaveStatusIndicator />}

          {/* Page settings — SEO + scripts d'en-tête — hidden on empty canvas */}
          <button
            type="button"
            className={cn(
              'v4-topbar-ghost transition-all duration-300 ease-in-out',
              isEmpty ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
            )}
            onClick={() => setPageSettingsOpen((prev) => !prev)}
            title="Configuration de la page"
            aria-label="Configuration de la page"
            data-testid="page-settings-trigger"
          >
            <Settings size={13} strokeWidth={1.8} aria-hidden />
          </button>
        </div>

        {/* CENTER — device segmented control (absolutely centred) */}
        <div
          className={cn(
            'v4-device-segmented transition-all duration-300 ease-in-out',
            isEmpty ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
          )}
          role="group"
          aria-label="Viewport"
        >
          {(Object.keys(DEVICE_ICONS) as DeviceMode[]).map((mode) => {
            const Icon     = DEVICE_ICONS[mode];
            const isActive = deviceMode === mode;
            return (
              <button
                key={mode}
                type="button"
                className={cn('v4-device-seg-btn', isActive && 'v4-device-seg-btn--active')}
                onClick={() => setDeviceMode(mode)}
                title={DEVICE_LABELS[mode]}
                data-testid={`device-${mode}`}
                aria-pressed={isActive}
              >
                <Icon size={15} strokeWidth={isActive ? 2.2 : 1.5} aria-hidden />
              </button>
            );
          })}
        </div>

        {/* RIGHT — action buttons */}
        <V4TopbarActions />
      </header>

      {/* ── Left sidebar — collapses to zero-width when the canvas is empty,
             slides open on "Parcourir les blocs" or any panel-opening action ── */}
      <aside
        className={cn('v4-workspace__left', !leftPanelOpen && 'v4-workspace__left--collapsed')}
        data-testid="left-sidebar-aside"
        aria-hidden={!leftPanelOpen}
      >
        <V4LeftSidebar activeTab={leftSidebarTab} onTabChange={setLeftSidebarTab} />
      </aside>

      {/* ── Canvas ───────────────────────────────────────────────── */}
      {/* transition-all ensures the canvas recenters fluidly when
          the PageSettingsDrawer or right inspector slides in/out */}
      <main className="v4-workspace__canvas transition-all duration-300 ease-in-out" data-testid="canvas-viewport">
        <div
          className={cn('v4-workspace__frame', `v4-workspace__frame--${deviceMode}`)}
          data-testid="campaign-frame"
        >
          <CanvasLayer editorMode />
        </div>
      </main>

      <PageSettingsDrawer open={pageSettingsOpen} onOpenChange={setPageSettingsOpen} />

      {/* ── Right inspector (hidden on empty canvas) ─────────────── */}
      {compactInspector ? (
        // Compact drawer: only open when showRight
        <V4InspectorDrawer open={showRight} onOpenChange={setRightPanelOpen} />
      ) : showRight ? (
        <aside
          className="v4-workspace__right"
          data-testid="inspector-panel-aside"
          style={{ ['--v4-inspector-width' as string]: `${inspectorWidth}px` }}
        >
          <div
            className="v4-workspace__right-resize"
            role="separator"
            aria-orientation="vertical"
            aria-label="Redimensionner le panneau propriétés"
            onPointerDown={onResizePointerDown}
          />
          <V4InspectorPanel />
        </aside>
      ) : (
        <div />
      )}

    </div>
  );
}
