import { Check } from 'lucide-react';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { cn } from '@/lib/utils';
import { useBuilderPreviewContext } from '../../context/BuilderPreviewContext';
import { CanvasCtaLink } from './CanvasCtaLink';

type TrimItem = {
  name?: string;
  price?: string;
  features?: string[];
  buttonText?: string;
  buttonHref?: string;
  featured?: boolean;
};

type PricingTrimBlockPreviewProps = {
  propsJson: Record<string, unknown>;
  interactive?: boolean;
};

export function PricingTrimBlockPreview({
  propsJson,
  interactive: interactiveProp,
}: PricingTrimBlockPreviewProps) {
  const previewContext = useBuilderPreviewContext();
  const interactive = interactiveProp ?? previewContext.interactive;

  const heading = asPropString(propsJson.heading) || 'Finitions & financement';
  const subtitle = asPropString(propsJson.subtitle);
  const rawTrims = Array.isArray(propsJson.trims) ? propsJson.trims : [];
  const trims = (rawTrims as TrimItem[]).slice(0, 3);

  while (trims.length < 3) {
    trims.push({
      name: `Finition ${trims.length + 1}`,
      price: '—',
      features: [],
      buttonText: 'Choisir',
      buttonHref: '#lead-form',
    });
  }

  return (
    <section className="w-full bg-white px-6 py-16 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2
            className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-3xl"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {heading}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{subtitle}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {trims.map((trim, index) => {
            const name = trim.name || `Finition ${index + 1}`;
            const price = trim.price || '—';
            const features = Array.isArray(trim.features) ? trim.features : [];
            const buttonText = trim.buttonText || 'Choisir cette finition';
            const buttonHref = trim.buttonHref || '#lead-form';
            const featured = Boolean(trim.featured);
            const buttonClass = cn(
              'mt-8 w-full min-h-[2.75rem] rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90',
              featured
                ? 'text-white'
                : 'border border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100',
            );

            return (
              <article
                key={`${name}-${index}`}
                className={cn(
                  'flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-neutral-900',
                  featured
                    ? 'border-[var(--primary,var(--lp-primary,#2563eb))] ring-2 ring-[var(--primary,var(--lp-primary,#2563eb))]/20'
                    : 'border-neutral-200 dark:border-neutral-800',
                )}
              >
                <h3
                  className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {name}
                </h3>
                <p
                  className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {price}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {features.map((feature, fi) => (
                    <li
                      key={`${feature}-${fi}`}
                      className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{ color: 'var(--primary, var(--lp-primary, #2563eb))' }}
                        aria-hidden
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <CanvasCtaLink
                  href={buttonHref}
                  interactive={interactive}
                  className={buttonClass}
                  style={
                    featured
                      ? { backgroundColor: 'var(--primary, var(--lp-primary, #2563eb))' }
                      : undefined
                  }
                >
                  {buttonText}
                </CanvasCtaLink>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
