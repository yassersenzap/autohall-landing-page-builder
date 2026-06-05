import { createContext, useContext, useMemo, type ReactNode } from 'react';

type StudioV2ContextValue = {
  pageVersionId: string;
  canWrite: boolean;
};

const StudioV2Context = createContext<StudioV2ContextValue | null>(null);

export function StudioV2Provider({
  pageVersionId,
  canWrite,
  children,
}: {
  pageVersionId: string;
  canWrite: boolean;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ pageVersionId, canWrite }),
    [pageVersionId, canWrite],
  );
  return <StudioV2Context.Provider value={value}>{children}</StudioV2Context.Provider>;
}

export function useStudioV2Context(): StudioV2ContextValue {
  const ctx = useContext(StudioV2Context);
  if (!ctx) {
    throw new Error('useStudioV2Context must be used within StudioV2Provider');
  }
  return ctx;
}
