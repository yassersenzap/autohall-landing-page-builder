export type MarketingSectionTemplate = {
  id: string;
  label: string;
  description: string;
  /** Types de blocs créés dans l’ordre (doivent être stables + backend). */
  blockTypes: string[];
};

export const MARKETING_SECTIONS: MarketingSectionTemplate[] = [
  {
    id: 'test-drive',
    label: 'Essai véhicule',
    description: 'Hero, formulaire et bandeau de confiance.',
    blockTypes: ['hero', 'lead_form', 'trust_bar'],
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
  {
    id: 'lead-capture',
    label: 'Capture lead',
    description: 'Hero minimal + formulaire.',
    blockTypes: ['hero', 'lead_form'],
  },
];
