import { cn } from '@/lib/utils';
import {
  parseBackgroundTheme,
  parseImageAlignment,
  type BlockBackgroundTheme,
} from '../../lib/block-design-props';
import { parseHeroProps } from '../../lib/block-props';

type HeroBlockPreviewProps = {
  propsJson: Record<string, unknown>;
};

function heroSurface(theme: BlockBackgroundTheme, hasImage: boolean) {
  if (theme === 'light') {
    return {
      section: 'text-zinc-900',
      gradient: hasImage
        ? 'from-white/95 via-white/80 to-zinc-100/90'
        : 'from-zinc-50 via-white to-zinc-100',
      eyebrow: 'border-zinc-200 bg-white/80 text-zinc-600',
      subtitle: 'text-zinc-600',
      primaryBtn:
        'bg-zinc-900 text-white hover:bg-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
      secondaryBtn: 'border-zinc-300 bg-white/70 text-zinc-800 hover:bg-white',
      glow: 'bg-red-500/10',
    };
  }

  if (theme === 'neutral') {
    return {
      section: 'text-white',
      gradient: hasImage
        ? 'from-zinc-900/95 via-zinc-800/85 to-zinc-700/80'
        : 'from-zinc-700 via-zinc-800 to-zinc-900',
      eyebrow: 'border-white/15 bg-white/10 text-zinc-200',
      subtitle: 'text-zinc-300',
      primaryBtn:
        'bg-white text-zinc-900 hover:bg-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
      secondaryBtn: 'border-white/20 bg-white/5 text-white hover:bg-white/10',
      glow: 'bg-white/5',
    };
  }

  return {
    section: 'text-white',
    gradient: hasImage
      ? 'from-black/95 via-zinc-950/90 to-red-950/50'
      : 'from-zinc-950 via-[#0c0a0a] to-red-950/40',
    eyebrow: 'border-red-500/30 bg-red-500/10 text-red-200',
    subtitle: 'text-zinc-400',
    primaryBtn:
      'bg-white text-black hover:bg-zinc-200 shadow-[0_12px_40px_rgba(255,255,255,0.15)]',
    secondaryBtn: 'border-white/20 bg-white/5 text-white hover:bg-white/10',
    glow: 'bg-red-600/20',
  };
}

/**
 * Hero premium Auto Hall — rendu éditeur haute fidélité (Tailwind).
 */
export function HeroBlockPreview({ propsJson }: HeroBlockPreviewProps) {
  const props = parseHeroProps(propsJson);
  const alignment = parseImageAlignment(propsJson.imageAlignment);
  const theme = parseBackgroundTheme(propsJson.backgroundTheme);
  const hasImage = Boolean(props.imageUrl);
  const surface = heroSurface(theme, hasImage);
  const imageFirst = alignment === 'left';

  return (
    <section
      className={cn(
        'builder-hero-premium relative isolate overflow-hidden',
        surface.section,
      )}
    >
      {hasImage ? (
        <>
          <img
            src={props.imageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 object-cover blur-[2px]"
          />
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br',
              surface.gradient,
            )}
          />
        </>
      ) : (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            surface.gradient,
          )}
        />
      )}

      <div
        className={cn(
          'pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full blur-3xl',
          surface.glow,
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_55%)]"
        aria-hidden
      />

      <div
        className={cn(
          'builder-hero-premium__layout relative mx-auto w-full max-w-6xl gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:gap-12 lg:py-20',
          imageFirst && 'builder-hero-premium__layout--media-left',
        )}
      >
        <div className="relative z-10 flex max-w-xl flex-col gap-6">
          {props.eyebrow ? (
            <p
              className={cn(
                'inline-flex w-fit items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em]',
                surface.eyebrow,
              )}
            >
              {props.eyebrow}
            </p>
          ) : null}

          {props.title ? (
            <h1 className="builder-hero-premium__title font-bold tracking-tight text-balance">
              {props.title}
            </h1>
          ) : null}

          {props.subtitle ? (
            <p
              className={cn(
                'max-w-lg text-base leading-relaxed sm:text-lg',
                surface.subtitle,
              )}
            >
              {props.subtitle}
            </p>
          ) : null}

          {props.buttonText || props.secondaryButtonText ? (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {props.buttonText ? (
                <span
                  className={cn(
                    'inline-flex cursor-default items-center justify-center rounded-full px-8 py-4 text-sm font-semibold transition-colors duration-200',
                    surface.primaryBtn,
                  )}
                >
                  {props.buttonText}
                </span>
              ) : null}
              {props.secondaryButtonText ? (
                <span
                  className={cn(
                    'inline-flex cursor-default items-center justify-center rounded-full border px-7 py-3.5 text-sm font-medium transition-colors duration-200',
                    surface.secondaryBtn,
                  )}
                >
                  {props.secondaryButtonText}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative z-10 flex min-h-[240px] items-end justify-center lg:min-h-[420px] lg:justify-end">
          {hasImage ? (
            <div className="relative w-full max-w-lg lg:max-w-none">
              <div
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-red-500/20 via-transparent to-white/10 blur-2xl"
                aria-hidden
              />
              <img
                src={props.imageUrl}
                alt={props.alt}
                loading="lazy"
                decoding="async"
                className={cn(
                  'relative mx-auto w-full max-w-md object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.45)]',
                  'translate-y-4 sm:max-w-lg lg:max-h-[460px] lg:max-w-none lg:translate-y-10 lg:scale-110',
                )}
              />
            </div>
          ) : (
            <div className="flex h-56 w-full max-w-md items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/5 text-sm text-white/50 backdrop-blur-sm">
              Visuel véhicule
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
