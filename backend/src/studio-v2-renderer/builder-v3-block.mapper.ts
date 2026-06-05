import type { Prisma } from '@prisma/client';
import type { ExportBlock } from '../page-export/static-export.builder';

type BuilderV3BlockInput = {
  type: string;
  sortOrder?: number;
  propsJson: Record<string, unknown>;
};

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function mapPromoToHeroForm(props: Record<string, unknown>): Record<string, unknown> {
  return {
    ...props,
    title: asString(props.title),
    subtitle: asString(props.subtitle),
    formTitle: asString(props.formTitle, 'Demandez votre offre'),
    formSubtitle: asString(props.formSubtitle),
    submitText: asString(props.submitText, 'Envoyer ma demande'),
    consentLabel: asString(props.consentLabel),
    requiredFieldsNote: asString(props.requiredFieldsNote),
    formConfig: props.formConfig,
  };
}

function mapVehicleFeaturesToFeatures(props: Record<string, unknown>): Record<string, unknown> {
  const items = Array.isArray(props.items) ? props.items : [];
  return {
    heading: asString(props.heading, asString(props.title, 'Caractéristiques')),
    subtitle: asString(props.subtitle),
    items,
    layout: 'showcase',
    imageUrl: asString(props.imageUrl),
    modelName: asString(props.modelName, 'Modèle'),
    modelTagline: asString(props.modelTagline),
  };
}

function mapRichTextToText(props: Record<string, unknown>): Record<string, unknown> {
  return {
    heading: asString(props.title, asString(props.heading)),
    content: asString(props.body, asString(props.content)),
  };
}

function mapMediaOnlyToImage(props: Record<string, unknown>): Record<string, unknown> {
  return {
    imageUrl: asString(props.imageUrl),
    alt: asString(props.alt, 'Visuel Auto Hall'),
    caption: asString(props.caption),
  };
}

function mapCtaBandToFinalCta(props: Record<string, unknown>): Record<string, unknown> {
  return {
    title: asString(props.title),
    subtitle: '',
    buttonText: asString(props.buttonText, 'Contactez-nous'),
    buttonTarget: asString(props.buttonHref, '#lead-form'),
  };
}

function mapPricingTrimToFinancing(props: Record<string, unknown>): Record<string, unknown> {
  const trims = Array.isArray(props.trims) ? props.trims : [];
  const featured = trims.find(
    (item) => item && typeof item === 'object' && (item as { featured?: boolean }).featured,
  ) as { price?: string; name?: string } | undefined;

  return {
    heading: asString(props.heading, 'Finitions & financement'),
    subtitle: asString(props.subtitle),
    paymentExample: asString(featured?.price, 'Sur devis'),
    bullets: trims
      .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
      .map((trim) => asString(trim.name))
      .filter(Boolean),
    ctaLabel: 'Demander une offre',
    ctaTarget: '#lead-form',
  };
}

/** Convertit les blocs Builder V3 vers le pipeline landing-render (page_blocks). */
export function mapBuilderV3BlocksToExportBlocks(
  blocks: BuilderV3BlockInput[],
): ExportBlock[] {
  const sorted = [...blocks].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  return sorted
    .map((block, index) => {
      const sortOrder = block.sortOrder ?? index + 1;
      const props = block.propsJson ?? {};

      switch (block.type) {
        case 'lead_form':
        case 'hero_campaign':
        case 'hero_form_campaign':
        case 'footer_legal':
        case 'faq':
        case 'testimonials':
          return { blockType: block.type, sortOrder, propsJson: props as Prisma.JsonValue };

        case 'promo_autohall':
          return {
            blockType: 'hero_form_campaign',
            sortOrder,
            propsJson: mapPromoToHeroForm(props) as Prisma.JsonValue,
          };

        case 'cta_band':
          return {
            blockType: 'final_cta',
            sortOrder,
            propsJson: mapCtaBandToFinalCta(props) as Prisma.JsonValue,
          };

        case 'vehicle_features':
          return {
            blockType: 'features',
            sortOrder,
            propsJson: mapVehicleFeaturesToFeatures(props) as Prisma.JsonValue,
          };

        case 'rich_text':
          return {
            blockType: 'text',
            sortOrder,
            propsJson: mapRichTextToText(props) as Prisma.JsonValue,
          };

        case 'media_only':
          return {
            blockType: 'image',
            sortOrder,
            propsJson: mapMediaOnlyToImage(props) as Prisma.JsonValue,
          };

        case 'pricing_trim':
          return {
            blockType: 'financing',
            sortOrder,
            propsJson: mapPricingTrimToFinancing(props) as Prisma.JsonValue,
          };

        case 'gallery':
        case 'video_embed':
        case 'spacer_divider':
          return {
            blockType: 'text',
            sortOrder,
            propsJson: {
              heading: asString(props.heading, block.type),
              content: asString(props.subtitle, 'Section visuelle Builder V3'),
            } as Prisma.JsonValue,
          };

        default:
          return {
            blockType: 'text',
            sortOrder,
            propsJson: {
              heading: block.type,
              content: 'Contenu Builder V3',
            } as Prisma.JsonValue,
          };
      }
    })
    .filter(Boolean);
}

export function mapBuilderV3ThemeToJson(
  pageTheme?: Record<string, unknown>,
  pageSettings?: Record<string, unknown>,
): Prisma.JsonValue {
  const primaryColor =
    typeof pageTheme?.primaryColor === 'string' ? pageTheme.primaryColor : '#b91c1c';
  const secondaryColor =
    typeof pageTheme?.secondaryColor === 'string' ? pageTheme.secondaryColor : '#1e293b';

  return {
    page: {
      theme: {
        primaryColor,
        secondaryColor,
        mode: pageTheme?.mode === 'dark' ? 'dark' : 'light',
        fontFamily:
          typeof pageTheme?.bodyFont === 'string'
            ? pageTheme.bodyFont
            : typeof pageTheme?.fontFamily === 'string'
              ? pageTheme.fontFamily
              : 'Roboto',
        headingFont:
          typeof pageTheme?.headingFont === 'string'
            ? pageTheme.headingFont
            : 'Inter',
        headingScale: pageTheme?.headingScale ?? 'normal',
        sectionSpacing: pageTheme?.sectionSpacing ?? 'normal',
        buttonStyle: pageTheme?.buttonStyle ?? 'rounded',
      },
      seo: {
        title:
          typeof pageSettings?.metaTitle === 'string'
            ? pageSettings.metaTitle
            : typeof pageTheme?.seoTitle === 'string'
              ? pageTheme.seoTitle
              : '',
        description:
          typeof pageSettings?.metaDescription === 'string'
            ? pageSettings.metaDescription
            : typeof pageTheme?.seoDescription === 'string'
              ? pageTheme.seoDescription
              : '',
      },
    },
  };
}
