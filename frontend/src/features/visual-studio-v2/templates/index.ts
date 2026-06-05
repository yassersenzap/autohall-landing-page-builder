export {
  STUDIO_V2_STARTERS as STUDIO_V2_TEMPLATES,
  STUDIO_V2_STARTERS,
  buildStarterDocument as buildStudioV2TemplateDocument,
  getStarter as getStudioV2Template,
  resolveStarterId as resolveStudioV2TemplateId,
  type CreativeStarter as StudioV2Template,
  type CreativeStarterId as StudioV2TemplateId,
} from '../creative-engine/starters';

/** Legacy template ids → new starter ids */
export const TEMPLATE_ID_ALIASES: Record<string, import('../creative-engine/types').CreativeStarterId> = {
  'capture-lead-rapide': 'lead-capture-simple',
  'offre-vehicule': 'vehicle-offer-promo',
  'prise-rendez-vous': 'after-sales-appointment',
  'lancement-gamme': 'premium-launch',
  'offre-financement': 'financing-offer',
  'offre-sav': 'after-sales-appointment',
  'ford-promo': 'vehicle-offer-promo',
  'gamme-thermique': 'premium-launch',
  'gamme-hev': 'event-landing',
};
