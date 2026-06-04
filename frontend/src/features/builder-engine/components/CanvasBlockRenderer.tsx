import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { BuilderDocumentBlock } from '../types';
import { HeroBlockPreview } from './preview/HeroBlockPreview';
import { LeadFormBlockPreview } from './preview/LeadFormBlockPreview';

type CanvasBlockRendererProps = {
  block: BuilderDocumentBlock;
};

function GenericBlockPreview({ block }: CanvasBlockRendererProps) {
  return (
    <div className="border-y border-dashed border-zinc-200 bg-zinc-50 px-6 py-10 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {block.label}
      </p>
      <p className="mt-1 font-mono text-[0.65rem] text-zinc-400">{block.type}</p>
      <p className="mt-3 text-xs text-zinc-500">
        Aperçu haute fidélité : Hero et Formulaire de contact.
      </p>
    </div>
  );
}

export function CanvasBlockRenderer({ block }: CanvasBlockRendererProps) {
  const type = block.type.toLowerCase();

  let content: ReactNode;
  switch (type) {
    case 'hero':
      content = <HeroBlockPreview propsJson={block.propsJson} />;
      break;
    case 'lead_form':
      content = <LeadFormBlockPreview propsJson={block.propsJson} />;
      break;
    default:
      content = <GenericBlockPreview block={block} />;
  }

  return (
    <div
      className={cn(
        'lp-document w-full overflow-hidden text-left',
        'max-w-none [&_.lp-section]:max-w-none',
      )}
      data-theme="light"
    >
      {content}
    </div>
  );
}
