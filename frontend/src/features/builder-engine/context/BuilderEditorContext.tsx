import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LeftPanelTab } from '../components/left-panel/BuilderLeftPanel';

type BuilderEditorContextValue = {
  canWrite: boolean;
  pageVersionId: string | null;
  landingPageId: string | null;
  leftPanelTab: LeftPanelTab;
  setLeftPanelTab: (tab: LeftPanelTab) => void;
  openMediaLibrary: () => void;
  openSectionsTab: () => void;
};

const BuilderEditorContext = createContext<BuilderEditorContextValue | null>(null);

export function BuilderEditorProvider({
  canWrite,
  pageVersionId = null,
  landingPageId = null,
  children,
}: {
  canWrite: boolean;
  pageVersionId?: string | null;
  landingPageId?: string | null;
  children: ReactNode;
}) {
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('blocks');

  const openMediaLibrary = useCallback(() => {
    setLeftPanelTab('media');
  }, []);

  const openSectionsTab = useCallback(() => {
    setLeftPanelTab('sections');
  }, []);

  const value = useMemo(
    () => ({
      canWrite,
      pageVersionId,
      landingPageId,
      leftPanelTab,
      setLeftPanelTab,
      openMediaLibrary,
      openSectionsTab,
    }),
    [canWrite, landingPageId, leftPanelTab, openMediaLibrary, openSectionsTab, pageVersionId],
  );

  return (
    <BuilderEditorContext.Provider value={value}>{children}</BuilderEditorContext.Provider>
  );
}

export function useBuilderEditorContext(): BuilderEditorContextValue {
  const ctx = useContext(BuilderEditorContext);
  if (!ctx) {
    return {
      canWrite: true,
      pageVersionId: null,
      landingPageId: null,
      leftPanelTab: 'blocks',
      setLeftPanelTab: () => undefined,
      openMediaLibrary: () => undefined,
      openSectionsTab: () => undefined,
    };
  }
  return ctx;
}
