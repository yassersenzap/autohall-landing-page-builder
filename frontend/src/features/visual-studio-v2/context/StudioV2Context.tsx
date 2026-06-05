import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type StudioV2Actions = {
  canWrite: boolean;
  onApplyStarter?: (starterId: string) => void;
  onInsertSection?: (sectionNodes: unknown[], afterIndex?: number) => void;
  onInsertSectionAfter?: (sectionId?: string) => void;
  onInsertBlock?: (block: { type: string; props: Record<string, unknown> }) => void;
  onOpenMediaPicker?: () => void;
  onFocusStarterTab?: () => void;
  onFocusSectionTab?: () => void;
};

type StudioV2ContextValue = {
  pageVersionId: string;
  canWrite: boolean;
  actions: StudioV2Actions | null;
};

const StudioV2Context = createContext<StudioV2ContextValue | null>(null);
const StudioV2ActionsContext = createContext<StudioV2Actions | null>(null);

export function StudioV2Provider({
  pageVersionId,
  canWrite,
  actions = null,
  children,
}: {
  pageVersionId: string;
  canWrite: boolean;
  actions?: StudioV2Actions | null;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ pageVersionId, canWrite, actions }),
    [pageVersionId, canWrite, actions],
  );
  return (
    <StudioV2Context.Provider value={value}>
      <StudioV2ActionsContext.Provider value={actions}>{children}</StudioV2ActionsContext.Provider>
    </StudioV2Context.Provider>
  );
}

export function useStudioV2Context(): StudioV2ContextValue {
  const ctx = useContext(StudioV2Context);
  if (!ctx) {
    throw new Error('useStudioV2Context must be used within StudioV2Provider');
  }
  return ctx;
}

export function useStudioV2Actions(): StudioV2Actions | null {
  return useContext(StudioV2ActionsContext);
}
