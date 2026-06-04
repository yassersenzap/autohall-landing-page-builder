import type { ReactNode } from 'react';
import { useBuilderDocumentStore } from '../store/builder-document.store';
import { FeaturesBlockPreview } from './preview/FeaturesBlockPreview';
import { FinalCtaBlockPreview } from './preview/FinalCtaBlockPreview';
import { FooterLegalBlockPreview } from './preview/FooterLegalBlockPreview';
import { HeroBlockPreview } from './preview/HeroBlockPreview';
import { LeadFormBlockPreview } from './preview/LeadFormBlockPreview';
import { TrustBarBlockPreview } from './preview/TrustBarBlockPreview';

type CanvasBlockRendererProps = {
  blockId: string;
};

function renderBlockContent(
  type: string,
  propsJson: Record<string, unknown>,
  label: string,
): ReactNode {
  switch (type) {
    case 'hero':
      return <HeroBlockPreview propsJson={propsJson} />;
    case 'lead_form':
      return <LeadFormBlockPreview propsJson={propsJson} />;
    case 'trust_bar':
      return <TrustBarBlockPreview propsJson={propsJson} />;
    case 'features':
      return <FeaturesBlockPreview propsJson={propsJson} />;
    case 'final_cta':
      return <FinalCtaBlockPreview propsJson={propsJson} />;
    case 'footer_legal':
      return <FooterLegalBlockPreview propsJson={propsJson} />;
    default:
      return (
        <div className="px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {label}
          </p>
          <p className="mt-1 font-mono text-[0.65rem] text-zinc-400">{type}</p>
        </div>
      );
  }
}

/**
 * Rendu canvas branché sur le store — reflète immédiatement updateBlockProps.
 */
export function CanvasBlockRenderer({ blockId }: CanvasBlockRendererProps): ReactNode {
  const block = useBuilderDocumentStore((s) => s.blocks.find((b) => b.id === blockId));

  if (!block) return null;

  const type = block.type.toLowerCase();

  return (
    <div
      className="builder-canvas-block block w-full min-w-full max-w-none"
      data-block-type={type}
      data-testid={`canvas-block-${blockId}`}
    >
      {renderBlockContent(type, block.propsJson, block.label)}
    </div>
  );
}
