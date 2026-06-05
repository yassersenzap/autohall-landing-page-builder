import {
  Maximize2,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
} from 'lucide-react';
import { ShadButton } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { useWorkspaceUi } from '../context/WorkspaceUiContext';

export function BuilderWorkspaceControls() {
  const {
    showLeftPanel,
    showRightPanel,
    focusMode,
    toggleLeftPanel,
    toggleRightPanel,
    toggleFocusMode,
    zoomLabel,
  } = useWorkspaceUi();

  return (
    <div
      className="hidden items-center gap-1 lg:flex"
      data-testid="builder-workspace-controls"
    >
      <ShadButton
        type="button"
        variant={showLeftPanel ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 px-2"
        title={showLeftPanel ? 'Masquer le panneau gauche' : 'Afficher le panneau gauche'}
        aria-pressed={showLeftPanel}
        data-testid="toggle-left-panel"
        onClick={toggleLeftPanel}
      >
        {showLeftPanel ? (
          <PanelLeftClose className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <PanelLeft className="h-3.5 w-3.5" aria-hidden />
        )}
        <span className="sr-only">Panneau gauche</span>
      </ShadButton>

      <ShadButton
        type="button"
        variant={focusMode ? 'default' : 'ghost'}
        size="sm"
        className={cn('h-8 px-2', focusMode && 'ring-2 ring-primary/30')}
        title="Mode focus (F)"
        aria-pressed={focusMode}
        data-testid="toggle-focus-mode"
        onClick={toggleFocusMode}
      >
        <Maximize2 className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden xl:inline">Focus</span>
      </ShadButton>

      <ShadButton
        type="button"
        variant={showRightPanel ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8 px-2"
        title={showRightPanel ? 'Masquer l’inspecteur' : 'Afficher l’inspecteur'}
        aria-pressed={showRightPanel}
        data-testid="toggle-right-panel"
        onClick={toggleRightPanel}
      >
        {showRightPanel ? (
          <PanelRightClose className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <PanelRight className="h-3.5 w-3.5" aria-hidden />
        )}
        <span className="sr-only">Inspecteur</span>
      </ShadButton>

      <span
        className="ml-1 hidden min-w-[5.5rem] font-mono text-[0.65rem] text-muted-foreground xl:inline"
        data-testid="workspace-zoom-label"
      >
        {zoomLabel}
      </span>
    </div>
  );
}
