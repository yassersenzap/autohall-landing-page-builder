import type { ReactNode } from 'react';
import type { BuilderDocumentBlock } from '../types';
import { FeaturesBlockPreview } from './preview/FeaturesBlockPreview';
import { FinalCtaBlockPreview } from './preview/FinalCtaBlockPreview';
import { FooterLegalBlockPreview } from './preview/FooterLegalBlockPreview';
import { HeroBlockPreview } from './preview/HeroBlockPreview';
import { LeadFormBlockPreview } from './preview/LeadFormBlockPreview';
import { TrustBarBlockPreview } from './preview/TrustBarBlockPreview';

type CanvasBlockRendererProps = {
  block: BuilderDocumentBlock;
};

export function CanvasBlockRenderer({ block }: CanvasBlockRendererProps): ReactNode {
  const type = block.type.toLowerCase();

  switch (type) {
    case 'hero':
      return <HeroBlockPreview propsJson={block.propsJson} />;
    case 'lead_form':
      return <LeadFormBlockPreview propsJson={block.propsJson} />;
    case 'trust_bar':
      return <TrustBarBlockPreview propsJson={block.propsJson} />;
    case 'features':
      return <FeaturesBlockPreview propsJson={block.propsJson} />;
    case 'final_cta':
      return <FinalCtaBlockPreview propsJson={block.propsJson} />;
    case 'footer_legal':
      return <FooterLegalBlockPreview propsJson={block.propsJson} />;
    default:
      return (
        <div className="px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {block.label}
          </p>
          <p className="mt-1 font-mono text-[0.65rem] text-zinc-400">{block.type}</p>
        </div>
      );
  }
}
