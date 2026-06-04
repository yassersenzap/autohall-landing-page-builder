export type MarketingSectionTemplate = {
  id: string;
  label: string;
  description: string;
  /** Types de blocs créés dans l’ordre (doivent être stables + backend). */
  blockTypes: string[];
};

/** Sections rapides V1 — complément aux modèles de page complets. */
export const MARKETING_SECTIONS: MarketingSectionTemplate[] = [
  {
    id: 'test-drive',
    label: 'Essai véhicule',
    description: 'Hero, formulaire, confiance et mentions légales.',
    blockTypes: ['hero', 'lead_form', 'trust_bar', 'footer_legal'],
  },
  {
    id: 'vehicle-offer',
    label: 'Offre véhicule',
    description: 'Hero, caractéristiques, CTA et formulaire.',
    blockTypes: ['hero', 'features', 'final_cta', 'lead_form'],
  },
  {
    id: 'sav-service',
    label: 'SAV & services',
    description: 'Hero, texte, formulaire et mentions légales.',
    blockTypes: ['hero', 'text', 'lead_form', 'footer_legal'],
  },
];
