import { cn } from '@/lib/utils';
import {
  parseBackgroundTheme,
  parseImageAlignment,
  type BlockBackgroundTheme,
} from '../../lib/block-design-props';
import { asPropString } from '../../lib/block-props';
import { parseListItems } from '../../lib/list-props';

type FeaturesBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function featuresSurface(theme: BlockBackgroundTheme) {
  if (theme === 'light') {
    return {
      section: 'bg-zinc-50 text-zinc-900',
      subtitle: 'text-zinc-600',
      spec: 'border-zinc-200 bg-white',
      specText: 'text-zinc-500',
    };
  }
  if (theme === 'neutral') {
    return {
      section: 'bg-zinc-800 text-white',
      subtitle: 'text-zinc-300',
      spec: 'border-white/10 bg-white/5',
      specText: 'text-zinc-400',
    };
  }
  return {
    section: 'bg-zinc-950 text-white',
    subtitle: 'text-zinc-400',
    spec: 'border-white/10 bg-white/5',
    specText: 'text-zinc-400',
  };
}

export function FeaturesBlockPreview({ propsJson }: FeaturesBlockPreviewProps) {
  const heading = asPropString(propsJson.heading);
  const subtitle = asPropString(propsJson.subtitle);
  const modelName = asPropString(propsJson.modelName);
  const modelTagline = asPropString(propsJson.modelTagline);
  const imageUrl = asPropString(propsJson.imageUrl);
  const imageAlt = asPropString(propsJson.alt) || 'Véhicule';
  const items = parseListItems(propsJson, 'items');
  const alignment = parseImageAlignment(propsJson.imageAlignment);
  const theme = parseBackgroundTheme(propsJson.backgroundTheme);
  const surface = featuresSurface(theme);
  const imageFirst = alignment === 'left';

  const mediaColumn = (
    <div className="relative flex items-center justify-center overflow-visible">
      {imageUrl ? (
        <div className="relative w-full overflow-visible">
          <div
            className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-red-500/15 via-transparent to-white/5 blur-2xl"
            aria-hidden
          />
          <img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="builder-features-premium__vehicle relative mx-auto aspect-[16/10] w-full max-w-xl rounded-2xl object-cover shadow-2xl lg:max-w-none lg:translate-x-4 lg:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/10] w-full max-w-xl items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 text-sm text-white/50">
          Visuel modèle
        </div>
      )}
    </div>
  );

  const copyColumn = (
    <div className="flex flex-col justify-center px-0">
      {modelName ? (
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">{modelName}</p>
      ) : null}
      {modelTagline ? (
        <p className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">{modelTagline}</p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-6 grid gap-3">
          {items.map((item, index) => (
            <li key={`${item.title}-${index}`} className={cn('rounded-xl border p-4', surface.spec)}>
              <strong className="text-sm font-semibold">{item.title}</strong>
              <p className={cn('mt-1 text-sm', surface.specText)}>{item.description}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  return (
    <section
      className={cn(
        'builder-features-premium relative w-full overflow-visible py-14 sm:py-16 lg:py-20',
        surface.section,
      )}
    >
      <div className="mx-auto w-full max-w-3xl px-0 text-center sm:max-w-4xl">
        {heading ? (
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{heading}</h2>
        ) : null}
        {subtitle ? (
          <p className={cn('mt-3 text-base sm:text-lg', surface.subtitle)}>{subtitle}</p>
        ) : null}
      </div>

      <div
        className={cn(
          'builder-features-premium__layout relative mx-auto mt-10 grid w-full max-w-6xl gap-10 lg:mt-12 lg:gap-14',
          imageFirst && 'builder-features-premium__layout--media-left',
        )}
      >
        {imageFirst ? (
          <>
            {mediaColumn}
            {copyColumn}
          </>
        ) : (
          <>
            {copyColumn}
            {mediaColumn}
          </>
        )}
      </div>
    </section>
  );
}
