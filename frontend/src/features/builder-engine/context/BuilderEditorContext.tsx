import { createContext, useContext, type ReactNode } from 'react';

type BuilderEditorContextValue = {
  canWrite: boolean;
};

const BuilderEditorContext = createContext<BuilderEditorContextValue>({
  canWrite: true,
});

export function BuilderEditorProvider({
  canWrite,
  children,
}: {
  canWrite: boolean;
  children: ReactNode;
}) {
  return (
    <BuilderEditorContext.Provider value={{ canWrite }}>
      {children}
    </BuilderEditorContext.Provider>
  );
}

export function useBuilderEditorContext(): BuilderEditorContextValue {
  return useContext(BuilderEditorContext);
}
