import { createContext, useContext, type ReactNode } from 'react';

export type BuilderLeadContextValue = {
  pageVersionId?: string;
  campaignId?: string;
  landingPageId?: string;
  landingSlug?: string;
  /** Formulaires actifs (aperçu / landing publiée). */
  interactive: boolean;
};

const BuilderPreviewContext = createContext<BuilderLeadContextValue>({
  interactive: false,
});

export function BuilderPreviewProvider({
  value,
  children,
}: {
  value: BuilderLeadContextValue;
  children: ReactNode;
}) {
  return (
    <BuilderPreviewContext.Provider value={value}>{children}</BuilderPreviewContext.Provider>
  );
}

export function useBuilderPreviewContext(): BuilderLeadContextValue {
  return useContext(BuilderPreviewContext);
}
