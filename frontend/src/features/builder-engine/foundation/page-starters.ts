/** Gabarit de page ou section marketing — sans nom de marque dans l’UI. */
export type PageStarterTier = 'active' | 'archived';

export type PageStarterTemplate = {
  id: string;
  label: string;
  description: string;
  /** `full-page` remplace le canvas ; `section` ajoute une séquence de blocs. */
  kind: 'full-page' | 'section';
  blockTypes: string[];
  /** Catégorie métier pour regroupement UI */
  category: 'acquisition' | 'vehicle' | 'sav' | 'financing' | 'event';
  /** `archived` — regroupé dans « Modèles archivés » (legacy). */
  tier?: PageStarterTier;
};

export const PAGE_STARTER_TEMPLATES: PageStarterTemplate[] = [
  {
    id: 'starter-capture-leads',
    kind: 'full-page',
    category: 'acquisition',
    tier: 'archived',
    label: 'Page capture de leads',
    description: 'Landing métier, réassurance et mentions légales.',
    blockTypes: ['core_campaign_form_landing', 'trust_bar', 'footer_legal'],
  },
  {
    id: 'starter-vehicle-offer',
    kind: 'full-page',
    category: 'vehicle',
    tier: 'archived',
    label: 'Page offre véhicule',
    description: 'Landing image + formulaire et pied de page légal.',
    blockTypes: ['core_campaign_form_landing', 'vehicle_features', 'footer_legal'],
  },
  {
    id: 'starter-sav-service',
    kind: 'full-page',
    category: 'sav',
    tier: 'archived',
    label: 'Page SAV & services',
    description: 'Landing avec formulaire contact, avantages services et FAQ.',
    blockTypes: ['core_campaign_form_landing', 'benefits', 'faq', 'footer_legal'],
  },
  {
    id: 'starter-financing',
    kind: 'full-page',
    category: 'financing',
    tier: 'archived',
    label: 'Page financement',
    description: 'Landing, grille finitions/prix et bandeau de conversion.',
    blockTypes: ['core_campaign_form_landing', 'pricing_trim', 'cta_band', 'footer_legal'],
  },
  {
    id: 'starter-event',
    kind: 'full-page',
    category: 'event',
    tier: 'archived',
    label: 'Page événement / essai',
    description: 'Landing événementielle avec galerie et capture lead intégrée.',
    blockTypes: ['core_campaign_form_landing', 'gallery', 'footer_legal'],
  },
  {
    id: 'section-test-drive',
    kind: 'section',
    category: 'event',
    tier: 'archived',
    label: 'Section essai véhicule',
    description: 'Landing métier, confiance et mentions.',
    blockTypes: ['core_campaign_form_landing', 'trust_bar', 'footer_legal'],
  },
  {
    id: 'section-vehicle-offer',
    kind: 'section',
    category: 'vehicle',
    tier: 'archived',
    label: 'Section offre modèle',
    description: 'Landing métier et caractéristiques véhicule.',
    blockTypes: ['core_campaign_form_landing', 'vehicle_features', 'footer_legal'],
  },
  {
    id: 'section-sav-service',
    kind: 'section',
    category: 'sav',
    tier: 'archived',
    label: 'Section SAV',
    description: 'Landing + formulaire, avantages et légal.',
    blockTypes: ['core_campaign_form_landing', 'benefits', 'footer_legal'],
  },
];

export function getPageStarterById(id: string): PageStarterTemplate | undefined {
  return PAGE_STARTER_TEMPLATES.find((s) => s.id === id);
}

export function getFullPageStarters(): PageStarterTemplate[] {
  return PAGE_STARTER_TEMPLATES.filter((s) => s.kind === 'full-page');
}

export function getSectionStarters(): PageStarterTemplate[] {
  return PAGE_STARTER_TEMPLATES.filter((s) => s.kind === 'section');
}

export function isArchivedPageStarter(starter: PageStarterTemplate): boolean {
  return (starter.tier ?? 'archived') === 'archived';
}

export function getActivePageStarters(): PageStarterTemplate[] {
  return PAGE_STARTER_TEMPLATES.filter((s) => s.tier === 'active');
}

export function getArchivedPageStarters(): PageStarterTemplate[] {
  return PAGE_STARTER_TEMPLATES.filter(isArchivedPageStarter);
}

export function getArchivedFullPageStarters(): PageStarterTemplate[] {
  return getArchivedPageStarters().filter((s) => s.kind === 'full-page');
}

export function getArchivedSectionStarters(): PageStarterTemplate[] {
  return getArchivedPageStarters().filter((s) => s.kind === 'section');
}

export function countArchivedTemplates(): number {
  return getArchivedPageStarters().length;
}

/** @deprecated Utiliser PAGE_STARTER_TEMPLATES — compat tests legacy. */
export const MARKETING_SECTIONS = getSectionStarters().map((s) => ({
  id: s.id.replace('section-', ''),
  label: s.label,
  description: s.description,
  blockTypes: s.blockTypes,
}));
