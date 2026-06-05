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

function countBlocks(nodes: PuckNode[]): number {
  let count = 0;
  walkNodes(nodes, () => {
    count += 1;
  });
  return count;
}

export function validateStudioV2Readiness(document: PuckDocument): ReadinessIssue[] {
  const issues: ReadinessIssue[] = [];
  const content = document.content ?? [];
  const rootProps = document.root?.props;

  if (!rootProps?.title?.trim()) {
    issues.push({
      level: 'warning',
      code: 'PAGE_TITLE_MISSING',
      message: 'Titre de page manquant (paramètres racine).',
    });
  }

  if (content.length === 0) {
    issues.push({ level: 'critical', code: 'EMPTY_PAGE', message: 'Aucun bloc sur la page.' });
    return issues;
  }

  const blockCount = countBlocks(content);
  if (blockCount < 3) {
    issues.push({
      level: 'warning',
      code: 'PAGE_TOO_SHORT',
      message: 'Landing courte — ajoutez au moins 3 blocs pour une page crédible.',
    });
  }

  let hasForm = false;
  let hasHero = false;
  let hasCta = false;

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
          message: 'Le formulaire doit avoir un libellé de bouton.',
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
      const cta = props.ctaPrimaryLabel ?? props.ctaLabel;
      const href = props.ctaPrimaryHref ?? props.ctaHref;
      if (cta && String(cta).trim()) {
        hasCta = true;
        if (!String(href ?? '').trim()) {
          issues.push({
            level: 'warning',
            code: 'CTA_NO_DESTINATION',
            message: 'Un bouton du hero n’a pas de destination.',
          });
        }
      }
      if (!props.imageAssetId && !props.imageUrl) {
        issues.push({
          level: 'warning',
          code: 'HERO_NO_IMAGE',
          message: 'Image hero manquante — remplacez le placeholder.',
        });
      }
      if (!props.imageAlt || !String(props.imageAlt).trim()) {
        issues.push({
          level: 'warning',
          code: 'HERO_NO_ALT',
          message: 'Texte alternatif image manquant sur le hero.',
        });
      }
    }

    if (node.type === 'VehicleOffer' || node.type === 'MediaImage') {
      if (!props.imageAssetId && !props.imageUrl) {
        issues.push({
          level: 'warning',
          code: 'MEDIA_PLACEHOLDER',
          message: `Image manquante sur le bloc ${node.type === 'VehicleOffer' ? 'offre' : 'image'}.`,
        });
      }
      if (!props.imageAlt || !String(props.imageAlt).trim()) {
        issues.push({
          level: 'warning',
          code: 'MEDIA_NO_ALT',
          message: 'Texte alternatif manquant sur une image.',
        });
      }
    }

    if (node.type === 'CTASection') {
      hasCta = true;
      if (props.buttonLabel && !String(props.buttonHref ?? '').trim()) {
        issues.push({
          level: 'warning',
          code: 'CTA_NO_DESTINATION',
          message: 'Le CTA final n’a pas de destination.',
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
      message: 'Ajoutez un formulaire lead ou rendez-vous.',
    });
  }

  const seo = rootProps?.seo;
  if (!seo?.title?.trim() || !seo?.description?.trim()) {
    issues.push({
      level: 'warning',
      code: 'SEO_INCOMPLETE',
      message: 'Meta title ou description SEO manquants.',
    });
  }

  if (!hasHero) {
    issues.push({
      level: 'warning',
      code: 'NO_HERO',
      message: 'Aucun hero — recommandé pour une landing marketing.',
    });
  }

  if (!hasCta) {
    issues.push({
      level: 'warning',
      code: 'NO_CTA',
      message: 'Aucun bouton d’action détecté (hero ou CTA).',
    });
  }

  let hasFooter = false;
  walkNodes(content, (node) => {
    if (node.type === 'FooterLegal') hasFooter = true;
  });
  if (!hasFooter) {
    issues.push({
      level: 'warning',
      code: 'NO_FOOTER',
      message: 'Pied de page légal absent — recommandé pour la production.',
    });
  }

  return issues;
}

export function hasCriticalReadinessIssues(issues: ReadinessIssue[]): boolean {
  return issues.some((issue) => issue.level === 'critical');
}
