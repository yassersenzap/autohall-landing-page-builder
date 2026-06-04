import { asPropString } from './block-props';

export type PageReadinessSeverity = 'critical' | 'warning';

export type PageReadinessIssue = {
  code: string;
  severity: PageReadinessSeverity;
  message: string;
};

export type PageReadinessTheme = {
  seoTitle?: string;
  seoDescription?: string;
};

export type PageReadinessBlock = {
  type: string;
  propsJson?: Record<string, unknown> | unknown;
};

function propsOf(block: PageReadinessBlock): Record<string, unknown> {
  const raw = block.propsJson;
  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function hasHeroImage(props: Record<string, unknown>): boolean {
  const assetId = asPropString(props.imageAssetId).trim();
  const url = asPropString(props.imageUrl).trim();
  return Boolean(assetId || url);
}

function hasImageBlockMedia(props: Record<string, unknown>): boolean {
  return hasHeroImage(props);
}

/**
 * Contrôles avant publication / export — ne modifie pas propsJson.
 */
export function getPageReadinessIssues(
  blocks: PageReadinessBlock[],
  theme: PageReadinessTheme = {},
): PageReadinessIssue[] {
  const issues: PageReadinessIssue[] = [];
  const seoTitle = (theme.seoTitle ?? '').trim();
  const seoDescription = (theme.seoDescription ?? '').trim();

  const heroBlocks = blocks.filter((b) => b.type === 'hero');
  for (const [index, block] of heroBlocks.entries()) {
    const props = propsOf(block);
    const label = heroBlocks.length > 1 ? ` (hero ${index + 1})` : '';
    if (!asPropString(props.title).trim()) {
      issues.push({
        code: `hero-title-${index}`,
        severity: 'critical',
        message: `Hero${label} : titre principal manquant.`,
      });
    }
    if (!hasHeroImage(props)) {
      issues.push({
        code: `hero-image-${index}`,
        severity: 'critical',
        message: `Hero${label} : aucune image sélectionnée.`,
      });
    }
  }

  if (!blocks.some((b) => b.type === 'lead_form')) {
    issues.push({
      code: 'lead-form-missing',
      severity: 'warning',
      message: 'Aucun formulaire de contact sur la page.',
    });
  }

  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'final_cta') continue;
    const props = propsOf(block);
    if (!asPropString(props.buttonText).trim()) {
      issues.push({
        code: `final-cta-button-${index}`,
        severity: 'critical',
        message: 'Bloc CTA final : texte du bouton manquant.',
      });
    }
  }

  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'image') continue;
    if (!hasImageBlockMedia(propsOf(block))) {
      issues.push({
        code: `image-block-${index}`,
        severity: 'critical',
        message: 'Bloc image : aucun média sélectionné.',
      });
    }
  }

  if (!seoTitle) {
    issues.push({
      code: 'seo-title',
      severity: 'critical',
      message: 'Titre SEO manquant (réglages page).',
    });
  }
  if (!seoDescription) {
    issues.push({
      code: 'seo-description',
      severity: 'critical',
      message: 'Description SEO manquante (réglages page).',
    });
  }

  return issues;
}

export function getCriticalPageReadinessIssues(
  issues: PageReadinessIssue[],
): PageReadinessIssue[] {
  return issues.filter((issue) => issue.severity === 'critical');
}
