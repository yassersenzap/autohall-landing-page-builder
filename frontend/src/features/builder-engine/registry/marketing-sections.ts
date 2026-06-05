export type MarketingSectionTemplate = {
  id: string;
  label: string;
  description: string;
  /** Types de blocs créés dans l’ordre (doivent être stables + backend). */
  blockTypes: string[];
};

/** Sections rapides — complément aux modèles de page complets. */
export const MARKETING_SECTIONS: MarketingSectionTemplate[] = [
  {
    id: 'test-drive',
    label: 'Essai véhicule',
    description: 'Hero, formulaire, confiance et mentions légales.',
    blockTypes: ['hero_campaign', 'lead_form', 'trust_bar', 'footer_legal'],
  },
  {
    id: 'vehicle-offer',
    label: 'Offre véhicule',
    description: 'Hero, offre véhicule, CTA et formulaire.',
    blockTypes: ['hero_campaign', 'vehicle_offer', 'final_cta', 'lead_form'],
  },
  {
    id: 'sav-service',
    label: 'SAV & services',
    description: 'Hero + formulaire, avantages et mentions légales.',
    blockTypes: ['hero_form_campaign', 'benefits', 'footer_legal'],
  },
];
