import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CanvasZoomLevel } from '../lib/canvas-frame';

export type CanvasZoomMode = 'fit' | 'manual';

type WorkspaceUiContextValue = {
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  focusMode: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleFocusMode: () => void;
  zoomMode: CanvasZoomMode;
  manualZoom: CanvasZoomLevel;
  effectiveZoom: number;
  setEffectiveZoom: (scale: number) => void;
  setZoomFit: () => void;
  setZoomManual: (level: CanvasZoomLevel) => void;
  zoomLabel: string;
};

const WorkspaceUiContext = createContext<WorkspaceUiContextValue | null>(null);

export function WorkspaceUiProvider({ children }: { children: ReactNode }) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [zoomMode, setZoomMode] = useState<CanvasZoomMode>('fit');
  const [manualZoom, setManualZoom] = useState<CanvasZoomLevel>(1);
  const [effectiveZoom, setEffectiveZoom] = useState(1);

  const showLeftPanel = !focusMode && !leftCollapsed;
  const showRightPanel = !focusMode && !rightCollapsed;

  const toggleLeftPanel = useCallback(() => {
    setFocusMode(false);
    setLeftCollapsed((v) => !v);
  }, []);

  const toggleRightPanel = useCallback(() => {
    setFocusMode(false);
    setRightCollapsed((v) => !v);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((v) => !v);
  }, []);

  const setZoomFit = useCallback(() => setZoomMode('fit'), []);
  const setZoomManual = useCallback((level: CanvasZoomLevel) => {
    setZoomMode('manual');
    setManualZoom(level);
  }, []);

  const zoomLabel =
    zoomMode === 'fit'
      ? `Ajusté · ${Math.round(effectiveZoom * 100)}%`
      : `${Math.round(effectiveZoom * 100)}%`;

  const value = useMemo(
    () => ({
      leftCollapsed,
      rightCollapsed,
      focusMode,
      showLeftPanel,
      showRightPanel,
      toggleLeftPanel,
      toggleRightPanel,
      toggleFocusMode,
      zoomMode,
      manualZoom,
      effectiveZoom,
      setEffectiveZoom,
      setZoomFit,
      setZoomManual,
      zoomLabel,
    }),
    [
      effectiveZoom,
      focusMode,
      leftCollapsed,
      manualZoom,
      rightCollapsed,
      showLeftPanel,
      showRightPanel,
      toggleFocusMode,
      toggleLeftPanel,
      toggleRightPanel,
      zoomLabel,
      zoomMode,
    ],
  );

  return (
    <WorkspaceUiContext.Provider value={value}>{children}</WorkspaceUiContext.Provider>
  );
}

export function useWorkspaceUi(): WorkspaceUiContextValue {
  const ctx = useContext(WorkspaceUiContext);
  if (!ctx) {
    throw new Error('useWorkspaceUi must be used within WorkspaceUiProvider');
  }
  return ctx;
}
