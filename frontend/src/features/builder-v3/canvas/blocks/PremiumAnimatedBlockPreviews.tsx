import type { CSSProperties } from 'react';
import { asPropString } from '@/features/builder-engine/lib/block-props';
import { HeroBlockImage } from '@/features/builder-engine/components/media/HeroBlockImage';
import { mergeBlockSectionPresentation } from '@/features/builder/section-style';
import { appendMotionToClass } from '@/features/builder/block-motion';
import { CanvasCtaLink } from './CanvasCtaLink';
import { CanvasEmptyHint } from './CanvasEmptyHint';

type Props = { propsJson: Record<string, unknown> };

function sectionClass(
  base: string,
  blockType: string,
  propsJson: Record<string, unknown>,
  extra = '',
) {
  const { className } = mergeBlockSectionPresentation(base, blockType, propsJson);
  const withMotion = appendMotionToClass(className, propsJson);
  return extra ? `${withMotion} ${extra}`.trim() : withMotion;
}

function readList(propsJson: Record<string, unknown>, key: string) {
  return Array.isArray(propsJson[key]) ? propsJson[key] : [];
}

export function PremiumBentoFeaturesBlockPreview({ propsJson }: Props) {
  const layout = asPropString(propsJson.layout) || '2x2';
  const visualStyle = asPropString(propsJson.visualStyle) || 'glass';
  const cards = readList(propsJson, 'cards');

  return (
    <section
      className={sectionClass(
        'lp-block lp-premium-bento',
        'premium_bento_features',
        propsJson,
        `lp-premium-bento--layout-${layout} lp-premium-bento--style-${visualStyle}`,
      )}
    >
      <div className="lp-section">
        {asPropString(propsJson.eyebrow) ? (
          <p className="lp-section-eyebrow">{asPropString(propsJson.eyebrow)}</p>
        ) : null}
        {asPropString(propsJson.title) ? (
          <h2 className="lp-section-title">{asPropString(propsJson.title)}</h2>
        ) : (
          <CanvasEmptyHint className="lp-section-title">Titre bento</CanvasEmptyHint>
        )}
        {asPropString(propsJson.subtitle) ? (
          <p className="lp-section-subtitle">{asPropString(propsJson.subtitle)}</p>
        ) : null}
        <div className="lp-premium-bento__grid">
          {cards.slice(0, 4).map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return (
              <article key={index} className="lp-premium-bento__card">
                <h3 className="lp-premium-bento__card-title">
                  {asPropString(row.title) || 'Avantage'}
                </h3>
                <p className="lp-premium-bento__card-text">
                  {asPropString(row.description) || 'Description'}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function AnimatedStatsStripBlockPreview({ propsJson }: Props) {
  const layout = asPropString(propsJson.layout) || 'grid';
  const style = asPropString(propsJson.style) || 'premium';
  const metrics = readList(propsJson, 'metrics');

  return (
    <section
      className={sectionClass(
        'lp-block lp-stats-strip',
        'animated_stats_strip',
        propsJson,
        `lp-stats-strip--layout-${layout} lp-stats-strip--style-${style}`,
      )}
    >
      <div className="lp-section">
        <div className="lp-stats-strip__grid">
          {metrics.slice(0, 4).map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return (
              <div key={index} className="lp-stats-strip__item">
                <span className="lp-stats-strip__value">
                  {asPropString(row.value) || '—'}
                </span>
                <p className="lp-stats-strip__label">{asPropString(row.label) || 'Indicateur'}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PremiumTestimonialsBlockPreview({ propsJson }: Props) {
  const style = asPropString(propsJson.style) || 'cards';
  const testimonials = readList(propsJson, 'testimonials');

  return (
    <section
      className={sectionClass(
        'lp-block lp-premium-testimonials',
        'premium_testimonials',
        propsJson,
        `lp-premium-testimonials--style-${style}`,
      )}
    >
      <div className="lp-section">
        {asPropString(propsJson.title) ? (
          <h2 className="lp-section-title">{asPropString(propsJson.title)}</h2>
        ) : null}
        <div className="lp-premium-testimonials__grid">
          {testimonials.slice(0, 3).map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return (
              <blockquote key={index} className="lp-premium-testimonials__card">
                <p className="lp-premium-testimonials__quote">
                  « {asPropString(row.quote) || 'Témoignage à compléter'} »
                </p>
                <footer className="lp-premium-testimonials__author">
                  <cite>{asPropString(row.author) || 'Client'}</cite>
                </footer>
              </blockquote>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function VehicleShowcaseSplitBlockPreview({ propsJson }: Props) {
  const layout = asPropString(propsJson.layout) || 'image_right';
  const visualStyle = asPropString(propsJson.visualStyle) || 'dark_card';
  const imageAssetId = asPropString(propsJson.imageAssetId);
  const imageUrl = asPropString(propsJson.imageUrl);
  const focalX = typeof propsJson.focalPointX === 'number' ? propsJson.focalPointX : 50;
  const focalY = typeof propsJson.focalPointY === 'number' ? propsJson.focalPointY : 50;
  const specs = readList(propsJson, 'specs');
  const ctas = readList(propsJson, 'ctas');

  const media = (
    <div
      className="lp-vehicle-showcase__media"
      style={
        {
          '--lp-media-focal-x': `${focalX}%`,
          '--lp-media-focal-y': `${focalY}%`,
        } as CSSProperties
      }
    >
      {imageAssetId || imageUrl ? (
        <HeroBlockImage
          imageAssetId={imageAssetId}
          imageUrl={imageUrl}
          alt={asPropString(propsJson.alt) || 'Véhicule'}
          className="lp-vehicle-showcase__img"
        />
      ) : (
        <div className="lp-vehicle-showcase__media lp-vehicle-showcase__media--placeholder" aria-hidden />
      )}
    </div>
  );

  const body = (
    <div className="lp-vehicle-showcase__body">
      {asPropString(propsJson.brand) ? (
        <p className="lp-vehicle-showcase__brand">{asPropString(propsJson.brand)}</p>
      ) : null}
      {asPropString(propsJson.model) ? (
        <p className="lp-vehicle-showcase__model">{asPropString(propsJson.model)}</p>
      ) : null}
      {asPropString(propsJson.headline) ? (
        <h2 className="lp-vehicle-showcase__headline">{asPropString(propsJson.headline)}</h2>
      ) : (
        <CanvasEmptyHint className="lp-vehicle-showcase__headline">Showcase véhicule</CanvasEmptyHint>
      )}
      {asPropString(propsJson.subtitle) ? (
        <p className="lp-vehicle-showcase__subtitle">{asPropString(propsJson.subtitle)}</p>
      ) : null}
      {asPropString(propsJson.price) ? (
        <p className="lp-vehicle-showcase__price">{asPropString(propsJson.price)}</p>
      ) : null}
      {specs.length > 0 ? (
        <ul className="lp-vehicle-showcase__specs">
          {specs.slice(0, 4).map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return (
              <li key={index} className="lp-vehicle-showcase__spec">
                <span>{asPropString(row.label)}</span>
                <strong>{asPropString(row.value)}</strong>
              </li>
            );
          })}
        </ul>
      ) : null}
      {ctas.length > 0 ? (
        <div className="lp-vehicle-showcase__ctas">
          {ctas.slice(0, 2).map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            const label = asPropString(row.label);
            if (!label) return null;
            return (
              <CanvasCtaLink
                key={index}
                interactive={false}
                href={asPropString(row.href) || '#lead-form'}
                className={`lp-btn lp-btn--${asPropString(row.variant) === 'secondary' ? 'secondary' : 'primary'} lp-btn--md`}
              >
                {label}
              </CanvasCtaLink>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  return (
    <section
      className={sectionClass(
        'lp-block lp-vehicle-showcase',
        'vehicle_showcase_split',
        propsJson,
        `lp-vehicle-showcase--layout-${layout} lp-vehicle-showcase--style-${visualStyle}`,
      )}
    >
      <div className="lp-section">
        <div className="lp-vehicle-showcase__panel">
          {layout === 'image_left' ? (
            <>
              {media}
              {body}
            </>
          ) : layout === 'background_focus' ? (
            <>
              {media}
              <div className="lp-vehicle-showcase__overlay">{body}</div>
            </>
          ) : (
            <>
              {body}
              {media}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function StickyLeadCtaBlockPreview({ propsJson }: Props) {
  const stickyMode = asPropString(propsJson.stickyMode) || 'bottom';
  const style = asPropString(propsJson.style) || 'brand';

  return (
    <section
      className={sectionClass(
        'lp-block lp-sticky-cta',
        'sticky_lead_cta',
        propsJson,
        `lp-sticky-cta--mode-${stickyMode} lp-sticky-cta--style-${style}`,
      )}
    >
      <div className="lp-sticky-cta__inner">
        <div className="lp-sticky-cta__copy">
          {asPropString(propsJson.label) ? (
            <p className="lp-sticky-cta__label">{asPropString(propsJson.label)}</p>
          ) : null}
          {asPropString(propsJson.title) ? (
            <p className="lp-sticky-cta__title">{asPropString(propsJson.title)}</p>
          ) : (
            <CanvasEmptyHint className="lp-sticky-cta__title">CTA conversion</CanvasEmptyHint>
          )}
        </div>
        <div className="lp-sticky-cta__actions">
          {asPropString(propsJson.primaryCtaLabel) ? (
            <CanvasCtaLink
              interactive={false}
              href={asPropString(propsJson.primaryCtaHref) || '#lead-form'}
              className="lp-btn lp-btn--primary lp-btn--md"
            >
              {asPropString(propsJson.primaryCtaLabel)}
            </CanvasCtaLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function CampaignTimelineStepsBlockPreview({ propsJson }: Props) {
  const style = asPropString(propsJson.style) || 'cards';
  const steps = readList(propsJson, 'steps');

  return (
    <section
      className={sectionClass(
        'lp-block lp-campaign-timeline',
        'campaign_timeline_steps',
        propsJson,
        `lp-campaign-timeline--style-${style}`,
      )}
    >
      <div className="lp-section">
        {asPropString(propsJson.title) ? (
          <h2 className="lp-section-title">{asPropString(propsJson.title)}</h2>
        ) : null}
        <ol className="lp-campaign-timeline__list">
          {steps.slice(0, 5).map((item, index) => {
            const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
            return (
              <li key={index} className="lp-campaign-timeline__step">
                <span className="lp-campaign-timeline__index">{index + 1}</span>
                <div className="lp-campaign-timeline__content">
                  <h3 className="lp-campaign-timeline__title">
                    {asPropString(row.title) || `Étape ${index + 1}`}
                  </h3>
                  <p className="lp-campaign-timeline__text">
                    {asPropString(row.description) || 'Description'}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
