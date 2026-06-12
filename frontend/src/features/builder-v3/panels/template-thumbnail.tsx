import type { CampaignPageTemplate } from '@/features/builder-engine/foundation/campaign-page-templates.types';
import {
  getPageBrandTheme,
  resolvePageBrandThemeId,
} from '@/features/builder/brand-presets/brand-theme-presets';

const CATEGORY_LABELS: Record<CampaignPageTemplate['category'], string> = {
  campaign: 'Campagne',
  model: 'Modèle',
  'test-drive': 'Essai',
  generic: 'Générique',
  brand: 'Marque',
  'vehicle-offer': 'Offre véhicule',
  service: 'Service',
};

type TemplateThumbnailProps = {
  template: CampaignPageTemplate;
};

/** CSS-only layout miniature — no remote images. */
function LayoutMiniature({ template }: { template: CampaignPageTemplate }) {
  const themeId = resolvePageBrandThemeId(template.brandId);
  const theme = getPageBrandTheme(themeId);
  const slice = template.blocks.slice(0, 5);

  return (
    <div
      className="relative flex h-[72px] flex-col gap-1 overflow-hidden rounded-md border border-neutral-800/80 bg-neutral-950 p-2"
      aria-hidden
      data-testid={`template-thumbnail-layout-${template.id}`}
    >
      {slice.map((block, index) => {
        const isHero =
          block.type === 'campaign_lead_hero' ||
          block.type === 'hero_vehicle_offer' ||
          block.type === 'vehicle_showcase_split';
        const height = isHero ? 'h-5' : index === slice.length - 1 ? 'h-2' : 'h-3';
        const opacity = isHero ? 'opacity-100' : 'opacity-70';
        return (
          <div
            key={`${block.type}-${index}`}
            className={`${height} ${opacity} rounded-sm`}
            style={{
              backgroundColor: isHero ? theme.primaryColor : theme.surfaceColor,
              border: isHero ? 'none' : `1px solid ${theme.primarySoft}`,
            }}
          />
        );
      })}
    </div>
  );
}

export function TemplateBrandStrip({ template }: TemplateThumbnailProps) {
  const theme = getPageBrandTheme(resolvePageBrandThemeId(template.brandId));

  return (
    <div
      className="flex h-1.5 w-full overflow-hidden rounded-full"
      data-testid={`template-brand-strip-${template.id}`}
      aria-hidden
    >
      <span className="h-full flex-1" style={{ backgroundColor: theme.primaryColor }} />
      <span className="h-full w-1/4" style={{ backgroundColor: theme.accentColor }} />
      <span className="h-full w-1/5" style={{ backgroundColor: theme.surfaceColor }} />
    </div>
  );
}

export function templateCategoryLabel(category: CampaignPageTemplate['category']): string {
  return CATEGORY_LABELS[category];
}

export function TemplateThumbnailPreview({ template }: TemplateThumbnailProps) {
  const theme = getPageBrandTheme(resolvePageBrandThemeId(template.brandId));

  return (
    <div className="space-y-2" data-testid={`template-thumbnail-${template.id}`}>
      <TemplateBrandStrip template={template} />
      <LayoutMiniature template={template} />
      <div className="flex items-center justify-between gap-2 text-[0.625rem] text-neutral-500">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
          style={{
            backgroundColor: theme.primarySoft,
            color: theme.primaryColor,
          }}
        >
          {templateCategoryLabel(template.category)}
        </span>
        <span>{template.blocks.length} blocs</span>
      </div>
    </div>
  );
}
