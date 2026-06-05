import type { PuckDocument, PuckNode } from './types';
import { ALLOWED_STUDIO_V2_COMPONENTS } from './types';

export type ReadinessLevel = 'critical' | 'warning';

export type ReadinessIssue = {
  level: ReadinessLevel;
  code: string;
  message: string;
};

function walkNodes(nodes: PuckNode[], visit: (node: PuckNode) => void): void {
  for (const node of nodes) {
    visit(node);
    const props = node.props ?? {};
    for (const value of Object.values(props)) {
      if (Array.isArray(value)) {
        walkNodes(
          value.filter(
            (item): item is PuckNode =>
              item !== null && typeof item === 'object' && 'type' in item,
          ),
          visit,
        );
      }
    }
  }
}

export function validateStudioV2Readiness(document: PuckDocument): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  const content = document.content ?? [];

  if (content.length === 0) {
    issues.push({ level: 'critical', code: 'EMPTY_PAGE', message: 'La page est vide.' });
    return issues;
  }

  let hasForm = false;
  let hasHero = false;

  walkNodes(content, (node) => {
    if (!(ALLOWED_STUDIO_V2_COMPONENTS as readonly string[]).includes(node.type)) {
      issues.push({
        level: 'critical',
        code: 'UNKNOWN_COMPONENT',
        message: `Composant inconnu : ${node.type}`,
      });
      return;
    }

    const props = node.props ?? {};

    if (node.type === 'LeadFormAutoHall') {
      hasForm = true;
      if (!props.submitText || !String(props.submitText).trim()) {
        issues.push({
          level: 'critical',
          code: 'FORM_NO_SUBMIT',
          message: 'Le formulaire doit avoir un texte de bouton envoi.',
        });
      }
      if (!props.consentText || !String(props.consentText).trim()) {
        issues.push({
          level: 'critical',
          code: 'FORM_NO_CONSENT',
          message: 'Le texte de consentement est obligatoire.',
        });
      }
    }

    if (node.type === 'HeroAutoHall') {
      hasHero = true;
      if (!props.title || !String(props.title).trim()) {
        issues.push({
          level: 'critical',
          code: 'HERO_NO_TITLE',
          message: 'Le hero doit avoir un titre.',
        });
      }
      const cta =
        props.ctaPrimaryLabel ?? props.ctaLabel;
      if (cta && String(cta).trim() && !String(props.ctaPrimaryHref ?? props.ctaHref ?? '').trim()) {
        issues.push({
          level: 'warning',
          code: 'HERO_CTA_NO_LINK',
          message: 'Le CTA principal du hero n’a pas de lien.',
        });
      }
      if (!props.imageAssetId && !props.imageUrl) {
        issues.push({
          level: 'warning',
          code: 'HERO_NO_IMAGE',
          message: 'Le hero n’a pas d’image.',
        });
      }
      if (!props.imageAlt || !String(props.imageAlt).trim()) {
        issues.push({
          level: 'warning',
          code: 'HERO_NO_ALT',
          message: 'Le hero n’a pas de texte alternatif image.',
        });
      }
    }

    if (node.type === 'VehicleRange' && Array.isArray(props.vehicles)) {
      const missing = props.vehicles.some(
        (v) =>
          v &&
          typeof v === 'object' &&
          !((v as Record<string, unknown>).imageAssetId || (v as Record<string, unknown>).imageUrl),
      );
      if (missing) {
        issues.push({
          level: 'warning',
          code: 'RANGE_MISSING_IMAGES',
          message: 'Certains véhicules de la gamme n’ont pas d’image.',
        });
      }
    }
  });

  if (!hasForm) {
    issues.push({
      level: 'critical',
      code: 'NO_FORM',
      message: 'La page doit contenir un formulaire lead.',
    });
  }

  const seo = document.root?.props?.seo;
  if (!seo?.title?.trim() || !seo?.description?.trim()) {
    issues.push({
      level: 'warning',
      code: 'SEO_INCOMPLETE',
      message: 'SEO title ou description manquant.',
    });
  }

  if (!hasHero) {
    issues.push({
      level: 'warning',
      code: 'NO_HERO',
      message: 'Aucun hero détecté sur la page.',
    });
  }

  return issues;
}

export function hasCriticalReadinessIssues(issues: ReadinessIssue[]): boolean {
  return issues.some((issue) => issue.level === 'critical');
}
