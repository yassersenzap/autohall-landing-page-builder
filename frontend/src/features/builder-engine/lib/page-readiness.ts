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

const MIN_SECTIONS_WARNING = 3;

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

function parseFaqItems(props: Record<string, unknown>): { question: string; answer: string }[] {
  const raw = props.items;
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => ({
      question: asPropString(item.question).trim(),
      answer: asPropString(item.answer).trim(),
    }))
    .filter((item) => item.question && item.answer);
}

/**
 * Contrôles qualité avant publication — ne modifie pas propsJson.
 * Seuls les points critiques bloquent la publication.
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
    const design = normalizeBlockDesign('hero', props);
    const suggestsImage =
      design.layoutVariant !== 'minimal' && design.mediaPosition !== 'none';
    if (suggestsImage && !hasHeroImage(props)) {
      issues.push({
        code: `hero-image-${index}`,
        severity: 'warning',
        message: `Hero${label} : aucune image — la page reste publiable.`,
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

  const hasLeadForm = blocks.some((b) => b.type === 'lead_form');
  if (!hasLeadForm) {
    issues.push({
      code: 'lead-form-missing',
      severity: 'critical',
      message: 'Aucun formulaire de contact — obligatoire pour capturer des leads.',
    });
  }

  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'lead_form') continue;
    const props = propsOf(block);
    if (!asPropString(props.submitText).trim()) {
      issues.push({
        code: `lead-form-submit-${index}`,
        severity: 'critical',
        message: 'Formulaire : texte du bouton d’envoi manquant.',
        blockId: block.id,
      });
    }
  }

  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'final_cta') continue;
    const props = propsOf(block);
    if (!asPropString(props.buttonText).trim()) {
      issues.push({
        code: `final-cta-button-${index}`,
        severity: 'warning',
        message: 'Bloc CTA final : texte du bouton manquant.',
        blockId: block.id,
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

  for (const block of blocks) {
    if (block.type !== 'footer_legal') continue;
    const props = propsOf(block);
    if (!asPropString(props.legalText).trim()) {
      issues.push({
        code: `footer-empty-${block.id ?? 'x'}`,
        severity: 'warning',
        message: 'Pied de page : mentions légales vides.',
        blockId: block.id,
      });
    }
  }

  for (const block of blocks) {
    if (block.type !== 'faq') continue;
    const props = propsOf(block);
    if (parseFaqItems(props).length === 0) {
      issues.push({
        code: `faq-empty-${block.id ?? 'x'}`,
        severity: 'warning',
        message: 'FAQ : aucune question/réponse renseignée.',
        blockId: block.id,
      });
    }
  }

  if (blocks.length > 0 && blocks.length < MIN_SECTIONS_WARNING) {
    issues.push({
      code: 'sections-few',
      severity: 'warning',
      message: `Peu de sections (${blocks.length}) — une landing complète en a généralement plus.`,
    });
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
