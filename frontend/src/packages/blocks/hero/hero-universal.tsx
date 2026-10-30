import { motion } from 'framer-motion';
import type { V4BlockRenderProps } from '../shared/types';
import { V4Section } from '../shared/section';
import { buildImageStyle, resolveImageSrc } from '../shared/media';
import { bool, str } from '../shared/props';
import { HeroBadge, HeroPrimaryButton } from './components/hero-ui';
import { cn } from '@/lib/utils';
import { parseHeroCampaignVariant } from './hero-campaign-presets';

function SecondaryCta({ label, href }: { label: string; href: string }) {
  if (!label) return null;
  return (
    <a href={href || '#'} className="lp-v4-btn lp-v4-btn--secondary">
      {label}
    </a>
  );
}

export function HeroUniversalRender({ propsJson }: V4BlockRenderProps) {
  const title = str(propsJson, 'title', 'Votre campagne Auto Hall');
  const subtitle = str(propsJson, 'subtitle');
  const badge = str(propsJson, 'badge');
  const body = str(propsJson, 'bodyText', subtitle);
  const layoutMode = str(propsJson, 'layoutMode', 'split');
  const imagePosition = str(propsJson, 'imagePosition', 'right');
  const alignment = str(propsJson, 'contentAlignment', 'left');
  const aspectRatio = str(propsJson, 'imageAspectRatio', '4/3');
  const gradientOn = bool(propsJson, 'gradientEnabled', true);
  const img = resolveImageSrc(propsJson);
  const overlayOpacity = typeof propsJson.overlayOpacity === 'number' ? propsJson.overlayOpacity : 45;
  const overlayColor = str(propsJson, 'overlayColor', '#0f172a');
  const isBackground = layoutMode === 'background';
  const imageRight = imagePosition === 'right';
  const campaignVariant = parseHeroCampaignVariant(propsJson.campaignVariant);
  const trustStat1 = str(propsJson, 'trustStat1');
  const trustStat2 = str(propsJson, 'trustStat2');
  const trustStat3 = str(propsJson, 'trustStat3');
  const partnerLogos = str(propsJson, 'partnerLogos');

  const trustRow =
    trustStat1 || trustStat2 || trustStat3 ? (
      <div className="lp-v4-hero-universal__trust">
        {[trustStat1, trustStat2, trustStat3]
          .filter(Boolean)
          .map((stat) => (
            <span key={stat} className="lp-v4-hero-universal__trust-item">
              {stat}
            </span>
          ))}
      </div>
    ) : null;

  const partners = partnerLogos ? (
    <div className="lp-v4-hero-universal__partners" aria-label="Partenaires">
      {partnerLogos.split('·').map((logo) => (
        <span key={logo.trim()} className="lp-v4-hero-universal__partner">
          {logo.trim()}
        </span>
      ))}
    </div>
  ) : null;

  const copy = (
    <motion.div
      className={cn(
        'lp-v4-hero-universal__copy',
        `lp-v4-hero-universal__copy--align-${alignment}`,
        `lp-v4-hero-universal__copy--variant-${campaignVariant}`,
        isBackground && 'lp-v4-hero-universal__copy--overlay',
      )}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
    >
      {badge ? <HeroBadge>{badge}</HeroBadge> : null}
      <h1 className="lp-v4-hero-universal__title">{title}</h1>
      {body ? <p className="lp-v4-hero-universal__subtitle">{body}</p> : null}
      <div className="lp-v4-hero-universal__actions">
        <HeroPrimaryButton href={str(propsJson, 'ctaHref', '#')}>
          {str(propsJson, 'ctaLabel', 'Découvrir')}
        </HeroPrimaryButton>
        <SecondaryCta
          label={str(propsJson, 'secondaryCtaLabel')}
          href={str(propsJson, 'secondaryCtaHref', '#')}
        />
      </div>
      {trustRow}
      {partners}
    </motion.div>
  );

  const media = (
    <motion.div
      className={cn(
        'lp-v4-hero-universal__media',
        `lp-v4-hero-universal__media--ratio-${aspectRatio.replace('/', '-')}`,
      )}
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.08 }}
    >
      {img ? (
        <img
          src={img}
          alt={str(propsJson, 'imageAlt', title)}
          className="lp-v4-hero-universal__image"
          style={buildImageStyle(propsJson)}
        />
      ) : (
        <div className="lp-v4-media-placeholder lp-v4-media-placeholder--hero">
          <span className="lp-v4-media-placeholder__label">Auto Hall</span>
        </div>
      )}
    </motion.div>
  );

  if (isBackground) {
    return (
      <V4Section blockType="hero_universal" className="lp-v4-hero-universal lp-v4-hero-universal--background">
        <div className="lp-v4-hero-universal__frame">
          {img ? (
            <img
              src={img}
              alt={str(propsJson, 'imageAlt', title)}
              className="lp-v4-hero-universal__bg-image"
              style={buildImageStyle(propsJson)}
            />
          ) : (
            <div className="lp-v4-media-placeholder lp-v4-media-placeholder--fill lp-v4-hero-universal__bg-fallback" aria-hidden />
          )}
          {gradientOn ? <div className="lp-v4-hero-universal__gradient" aria-hidden /> : null}
          <div
            className="lp-v4-hero-universal__overlay"
            style={{ backgroundColor: overlayColor, opacity: overlayOpacity / 100 }}
          />
          {copy}
        </div>
      </V4Section>
    );
  }

  return (
    <V4Section blockType="hero_universal" className="lp-v4-hero-universal lp-v4-hero-universal--split">
      <div
        className={cn(
          'lp-v4-hero-universal__grid',
          imageRight ? 'lp-v4-hero-universal__grid--image-right' : 'lp-v4-hero-universal__grid--image-left',
        )}
      >
        {imageRight ? (
          <>
            {copy}
            {media}
          </>
        ) : (
          <>
            {media}
            {copy}
          </>
        )}
      </div>
    </V4Section>
  );
}
