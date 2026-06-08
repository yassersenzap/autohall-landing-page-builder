/** Gabarit de page ou section marketing — sans nom de marque dans l’UI. */
export type PageStarterTemplate = {
  id: string;
  label: string;
  description: string;
  /** `full-page` remplace le canvas ; `section` ajoute une séquence de blocs. */
  kind: 'full-page' | 'section';
  blockTypes: string[];
  /** Catégorie métier pour regroupement UI */
  category: 'acquisition' | 'vehicle' | 'sav' | 'financing' | 'event';
};

export const PAGE_STARTER_TEMPLATES: PageStarterTemplate[] = [
  {
    id: 'starter-capture-leads',
    kind: 'full-page',
    category: 'acquisition',
    label: 'Page capture de leads',
    description: 'Hero acquisition, formulaire intégré, réassurance et mentions légales.',
    blockTypes: ['promo_autohall', 'trust_bar', 'footer_legal'],
  },
  {
    id: 'starter-vehicle-offer',
    kind: 'full-page',
    category: 'vehicle',
    label: 'Page offre véhicule',
    description: 'Bannière campagne, fiche offre, CTA final et formulaire.',
    blockTypes: ['hero_campaign', 'vehicle_offer', 'final_cta', 'lead_form', 'footer_legal'],
  },
  {
    id: 'starter-sav-service',
    kind: 'full-page',
    category: 'sav',
    label: 'Page SAV & services',
    description: 'Hero avec formulaire, avantages services et pied de page légal.',
    blockTypes: ['hero_form_campaign', 'benefits', 'faq', 'footer_legal'],
  },
  {
    id: 'starter-financing',
    kind: 'full-page',
    category: 'financing',
    label: 'Page financement',
    description: 'Hero, grille finitions/prix et bandeau de conversion.',
    blockTypes: ['hero_campaign', 'pricing_trim', 'cta_band', 'lead_form'],
  },
  {
    id: 'starter-event',
    kind: 'full-page',
    category: 'event',
    label: 'Page événement / essai',
    description: 'Mise en avant événementielle avec capture lead.',
    blockTypes: ['hero_campaign', 'gallery', 'lead_form', 'footer_legal'],
  },
  {
    id: 'section-test-drive',
    kind: 'section',
    category: 'event',
    label: 'Section essai véhicule',
    description: 'Hero, formulaire, confiance et mentions.',
    blockTypes: ['hero_campaign', 'lead_form', 'trust_bar', 'footer_legal'],
  },
  {
    id: 'section-vehicle-offer',
    kind: 'section',
    category: 'vehicle',
    label: 'Section offre modèle',
    description: 'Hero, fiche offre, CTA et formulaire.',
    blockTypes: ['hero_campaign', 'vehicle_offer', 'final_cta', 'lead_form'],
  },
  {
    id: 'section-sav-service',
    kind: 'section',
    category: 'sav',
    label: 'Section SAV',
    description: 'Hero + formulaire, avantages et légal.',
    blockTypes: ['hero_form_campaign', 'benefits', 'footer_legal'],
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

/** @deprecated Utiliser PAGE_STARTER_TEMPLATES — compat tests legacy. */
export const MARKETING_SECTIONS = getSectionStarters().map((s) => ({
  id: s.id.replace('section-', ''),
  label: s.label,
  description: s.description,
  blockTypes: s.blockTypes,
}));
