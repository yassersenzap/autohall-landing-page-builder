import type { BuilderLeadContextValue } from '@/features/builder-v4/context/BuilderPreviewContext';

export type V4BlockRenderProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
  previewContext?: BuilderLeadContextValue;
};

export type V4BlockCategory = 'hero' | 'content' | 'media' | 'conversion' | 'business';

export type V4HtmlDeps = {
  assetPublicUrl: (assetId: string) => string;
};
