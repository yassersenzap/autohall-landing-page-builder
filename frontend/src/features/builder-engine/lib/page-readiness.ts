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

function formPropsFromBlock(props: Record<string, unknown>): Record<string, unknown> {
  const form = props.form;
  if (form && typeof form === 'object' && !Array.isArray(form)) {
    return form as Record<string, unknown>;
  }
  return props;
}

function hasHeroImage(props: Record<string, unknown>): boolean {
  return Boolean(asPropString(props.imageAssetId).trim() || asPropString(props.imageUrl).trim());
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

function isHeroType(type: string): boolean {
  return type === 'hero' || type === 'hero_campaign';
}

export function getPageReadinessIssues(
  blocks: PageReadinessBlock[],
  theme: PageReadinessTheme = {},
): PageReadinessIssue[] {
  const issues: PageReadinessIssue[] = [];
  const seoTitle = (theme.seoTitle ?? '').trim();
  const seoDescription = (theme.seoDescription ?? '').trim();

  const heroBlocks = blocks.filter((b) => isHeroType(b.type));
  for (const [index, block] of heroBlocks.entries()) {
    const props = propsOf(block);
    const label = heroBlocks.length > 1 ? ` (hero ${index + 1})` : '';
    if (!asPropString(props.title).trim()) {
      issues.push({
        code: `hero-title-${index}`,
        severity: 'critical',
        message: `Hero${label} : titre principal manquant.`,
        blockId: block.id,
      });
    }
    const design = normalizeBlockDesign('hero', props);
    const suggestsImage =
      design.layoutVariant !== 'minimal' && design.mediaPosition !== 'none';
    if (suggestsImage && !hasHeroImage(props)) {
      issues.push({
        code: `hero-image-${index}`,
        severity: 'warning',
        message: `Hero${label} : image manquante.`,
        blockId: block.id,
      });
    }
    if (hasHeroImage(props) && !asPropString(props.alt).trim()) {
      issues.push({
        code: `hero-alt-${index}`,
        severity: 'warning',
        message: `Hero${label} : texte alternatif image manquant.`,
        blockId: block.id,
      });
    }
  }

  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'hero_form_campaign') continue;
    const props = propsOf(block);
    const fp = formPropsFromBlock(props);
    if (!asPropString(props.title).trim()) {
      issues.push({
        code: `hero-form-title-${index}`,
        severity: 'critical',
        message: 'Hero + Formulaire : titre manquant.',
        blockId: block.id,
      });
    }
    if (!asPropString(fp.submitText).trim()) {
      issues.push({
        code: `hero-form-submit-${index}`,
        severity: 'critical',
        message: 'Hero + Formulaire : texte du bouton d’envoi manquant.',
        blockId: block.id,
      });
    }
    const formConfig = fp.formConfig as Record<string, unknown> | undefined;
    if (formConfig?.showConsent !== false && !asPropString(fp.consentLabel).trim()) {
      issues.push({
        code: `hero-form-consent-${index}`,
        severity: 'critical',
        message: 'Hero + Formulaire : consentement manquant.',
        blockId: block.id,
      });
    }
  }

  const hasLeadForm =
    blocks.some((b) => b.type === 'lead_form') ||
    blocks.some((b) => b.type === 'hero_form_campaign');
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
    const formConfig = props.formConfig as Record<string, unknown> | undefined;
    if (formConfig?.showConsent !== false && !asPropString(props.consentLabel).trim()) {
      issues.push({
        code: `lead-form-consent-${index}`,
        severity: 'critical',
        message: 'Formulaire : complétez le consentement données personnelles.',
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
        severity: 'critical',
        message: 'CTA final : texte du bouton manquant.',
        blockId: block.id,
      });
    }
  }

  for (const [index, block] of blocks.entries()) {
    if (block.type !== 'vehicle_range') continue;
    const props = propsOf(block);
    const vehicles = Array.isArray(props.vehicles) ? props.vehicles : [];
    const named = vehicles.filter(
      (v) =>
        v &&
        typeof v === 'object' &&
        typeof (v as Record<string, unknown>).name === 'string' &&
        String((v as Record<string, unknown>).name).trim(),
    );
    if (named.length === 0) {
      issues.push({
        code: `vehicle-range-empty-${index}`,
        severity: 'critical',
        message: 'Gamme véhicules : ajoutez au moins un modèle.',
        blockId: block.id,
      });
    }
  }

  for (const block of blocks) {
    if (block.type !== 'faq') continue;
    if (parseFaqItems(propsOf(block)).length === 0) {
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
      severity: 'warning',
      message: 'Titre SEO manquant (réglages page).',
    });
  }
  if (!seoDescription) {
    issues.push({
      code: 'seo-description',
      severity: 'warning',
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
