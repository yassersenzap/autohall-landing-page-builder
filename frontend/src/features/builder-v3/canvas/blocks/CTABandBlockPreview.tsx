import { asPropString } from '@/features/builder-engine/lib/block-props';
import { useBuilderPreviewContext } from '../../context/BuilderPreviewContext';
import { CanvasCtaLink } from './CanvasCtaLink';

type CTABandBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function CTABandBlockPreview({
  propsJson,
  interactive: interactiveProp,
}: CTABandBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const interactive = interactiveProp ?? previewContext.interactive;

  const title = asPropString(propsJson.title) || 'Prêt à passer à l’action ?';
  const buttonText = asPropString(propsJson.buttonText) || 'Contactez-nous';
  const buttonHref = asPropString(propsJson.buttonHref) || '#lead-form';

  return (
    <section
      className="w-full px-6 py-12 text-white"
      style={{ backgroundColor: 'var(--primary, var(--lp-primary, #2563eb))' }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 sm:flex-row">
        <h2
          className="text-xl font-bold tracking-tight sm:text-2xl"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {title}
        </h2>
        <CanvasCtaLink
          href={buttonHref}
          interactive={interactive}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold shadow-lg transition-opacity hover:opacity-90"
          style={{ color: 'var(--primary, var(--lp-primary, #2563eb))' }}
        >
          {buttonText}
        </CanvasCtaLink>
      </div>
    </section>
  );
}
