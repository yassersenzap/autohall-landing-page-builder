import type { BuilderDocumentBlock } from '@/features/builder-engine/types';
import { HeroBlockPreview } from './HeroBlockPreview';
import { HeroFormCampaignBlockPreview } from './HeroFormCampaignBlockPreview';
import { LeadFormBlockPreview } from './LeadFormBlockPreview';
import { PromoAutoHallBlockPreview } from './PromoAutoHallBlockPreview';
import { VehicleFeaturesBlockPreview } from './VehicleFeaturesBlockPreview';
import { GalleryBlockPreview } from './GalleryBlockPreview';
import { FooterLegalBlockPreview } from './FooterLegalBlockPreview';
import { RichTextBlockPreview } from './RichTextBlockPreview';
import { MediaOnlyBlockPreview } from './MediaOnlyBlockPreview';
import { SpacerDividerBlockPreview } from './SpacerDividerBlockPreview';
import { VideoEmbedBlockPreview } from './VideoEmbedBlockPreview';
import { CTABandBlockPreview } from './CTABandBlockPreview';
import { PricingTrimBlockPreview } from './PricingTrimBlockPreview';
import { FAQBlockPreview } from './FAQBlockPreview';
import { TestimonialBlockPreview } from './TestimonialBlockPreview';
import {
  BenefitsBlockPreview,
  FinalCtaBlockPreview,
  TrustBarBlockPreview,
  VehicleOfferBlockPreview,
  VehicleRangeBlockPreview,
} from './MarketingBlockPreviews';
import { HeroVehicleOfferBlockPreview } from './HeroVehicleOfferBlockPreview';

type IframeBlockRendererProps = {
  block: BuilderDocumentBlock;
};

export function IframeBlockRenderer({ block }: IframeBlockRendererProps) {
  switch (block.type) {
    case 'promo_autohall':
      return <PromoAutoHallBlockPreview propsJson={block.propsJson} />;
    case 'vehicle_features':
      return <VehicleFeaturesBlockPreview propsJson={block.propsJson} />;
    case 'gallery':
      return <GalleryBlockPreview propsJson={block.propsJson} />;
    case 'footer_legal':
      return <FooterLegalBlockPreview propsJson={block.propsJson} />;
    case 'rich_text':
      return <RichTextBlockPreview propsJson={block.propsJson} />;
    case 'media_only':
      return <MediaOnlyBlockPreview propsJson={block.propsJson} />;
    case 'spacer_divider':
      return <SpacerDividerBlockPreview propsJson={block.propsJson} />;
    case 'video_embed':
      return <VideoEmbedBlockPreview propsJson={block.propsJson} />;
    case 'cta_band':
      return <CTABandBlockPreview propsJson={block.propsJson} />;
    case 'pricing_trim':
      return <PricingTrimBlockPreview propsJson={block.propsJson} />;
    case 'faq':
      return <FAQBlockPreview propsJson={block.propsJson} />;
    case 'testimonials':
      return <TestimonialBlockPreview propsJson={block.propsJson} />;
    case 'hero_campaign':
      return <HeroBlockPreview propsJson={block.propsJson} />;
    case 'hero_form_campaign':
      return <HeroFormCampaignBlockPreview propsJson={block.propsJson} />;
    case 'hero_vehicle_offer':
      return <HeroVehicleOfferBlockPreview propsJson={block.propsJson} />;
    case 'lead_form':
      return <LeadFormBlockPreview propsJson={block.propsJson} />;
    case 'vehicle_offer':
      return <VehicleOfferBlockPreview propsJson={block.propsJson} />;
    case 'vehicle_range':
      return <VehicleRangeBlockPreview propsJson={block.propsJson} />;
    case 'benefits':
      return <BenefitsBlockPreview propsJson={block.propsJson} />;
    case 'trust_bar':
      return <TrustBarBlockPreview propsJson={block.propsJson} />;
    case 'final_cta':
      return <FinalCtaBlockPreview propsJson={block.propsJson} />;
    default:
      return (
        <section className="lp-section" style={{ padding: '2rem', background: '#f8fafc' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
            Bloc « {block.label} » ({block.type}) — preview V3 à venir
          </p>
        </section>
      );
  }
}
