import { asPropString } from './block-props';
import { normalizeBlockDesign } from './block-style';

export type PageReadinessSeverity = 'critical' | 'warning';

export type PageReadinessStatus = 'ready' | 'incomplete' | 'blocked';

export type PageReadinessIssue = {
  code: string;
  severity: PageReadinessSeverity;
  message: string;
  blockId?: string;
};

export type PageReadinessTheme = {
  seoTitle?: string;
  seoDescription?: string;
};

export type PageReadinessBlock = {
  id?: string;
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
    const design = normalizeBlockDesign('hero', props);
    const label = heroBlocks.length > 1 ? ` (hero ${index + 1})` : '';
    const bid = block.id;
    if (!asPropString(props.title).trim()) {
      issues.push({
        code: `hero-title-${index}`,
        severity: 'critical',
        message: `Hero${label} : titre principal manquant.`,
        blockId: bid,
      });
    }
    if (!asPropString(props.buttonText).trim()) {
      issues.push({
        code: `hero-cta-${index}`,
        severity: 'critical',
        message: `Hero${label} : CTA principal vide.`,
        blockId: bid,
      });
    }
    const needsImage =
      design.layoutVariant !== 'minimal' && design.mediaPosition !== 'none';
    if (needsImage && !hasHeroImage(props)) {
      issues.push({
        code: `hero-image-${index}`,
        severity: 'critical',
        message: `Hero${label} : aucune image sélectionnée.`,
        blockId: bid,
      });
    }
    if (hasHeroImage(props) && !asPropString(props.alt).trim()) {
      issues.push({
        code: `hero-alt-${index}`,
        severity: 'warning',
        message: `Hero${label} : texte alternatif image manquant.`,
        blockId: bid,
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
    const props = propsOf(block);
    if (!hasImageBlockMedia(props)) {
      issues.push({
        code: `image-block-${index}`,
        severity: 'critical',
        message: 'Bloc image : aucun média sélectionné.',
        blockId: block.id,
      });
    } else if (!asPropString(props.alt).trim()) {
      issues.push({
        code: `image-alt-${index}`,
        severity: 'warning',
        message: 'Bloc image : texte alternatif manquant.',
        blockId: block.id,
      });
    }
  }

  for (const block of blocks) {
    if (block.type !== 'text') continue;
    const props = propsOf(block);
    if (!asPropString(props.heading).trim() && !asPropString(props.content).trim()) {
      issues.push({
        code: `text-empty-${block.id ?? 'x'}`,
        severity: 'warning',
        message: 'Section texte vide.',
        blockId: block.id,
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

export function getPageReadinessStatus(issues: PageReadinessIssue[]): PageReadinessStatus {
  if (getCriticalPageReadinessIssues(issues).length > 0) return 'blocked';
  if (issues.length > 0) return 'incomplete';
  return 'ready';
}
