export type HeroCampaignVariant = 'vehicle' | 'sav' | 'financing' | 'commercial' | 'default';

export const HERO_CAMPAIGN_LABELS: Record<HeroCampaignVariant, string> = {
  default: 'Générique',
  vehicle: 'Essai véhicule',
  sav: 'SAV & entretien',
  financing: 'Financement',
  commercial: 'Offre commerciale',
};

export function heroPresetForVariant(variant: HeroCampaignVariant): Record<string, unknown> {
  switch (variant) {
    case 'vehicle':
      return {
        campaignVariant: 'vehicle',
        badge: 'Essai gratuit',
        title: 'Réservez votre essai en concession',
        subtitle: 'Découvrez nos modèles neufs et occasions premium.',
        bodyText: 'Essai sans engagement, conseiller dédié et reprise de votre véhicule.',
        ctaLabel: 'Réserver mon essai',
        ctaHref: '#formulaire',
        secondaryCtaLabel: 'Voir les modèles',
        trustStat1: '30+ marques',
        trustStat2: '50 concessions',
        trustStat3: 'Réponse 24h',
        partnerLogos: 'Ford · BMW · Renault · Chery',
      };
    case 'sav':
      return {
        campaignVariant: 'sav',
        badge: 'Service Auto Hall',
        title: 'Votre véhicule entre de bonnes mains',
        subtitle: "Entretien, réparation et pièces d'origine.",
        bodyText: 'Prise en charge rapide, véhicule de courtoisie et transparence totale.',
        ctaLabel: 'Prendre rendez-vous',
        ctaHref: '#formulaire',
        secondaryCtaLabel: 'Nos services',
        trustStat1: 'Experts certifiés',
        trustStat2: "Pièces d'origine",
        trustStat3: 'Garantie constructeur',
        partnerLogos: 'Atelier · Diagnostic · Garantie',
      };
    case 'financing':
      return {
        campaignVariant: 'financing',
        badge: 'Financement sur mesure',
        title: 'Roulez maintenant, payez sereinement',
        subtitle: 'Crédit, LOA ou LLD — simulation gratuite.',
        bodyText: 'Apport flexible, mensualités adaptées et accompagnement personnalisé.',
        ctaLabel: 'Simuler mon financement',
        ctaHref: '#formulaire',
        secondaryCtaLabel: 'Nous contacter',
        trustStat1: 'Taux compétitifs',
        trustStat2: 'Réponse 48h',
        trustStat3: 'Sans engagement',
        partnerLogos: 'Crédit · LOA · LLD',
      };
    case 'commercial':
      return {
        campaignVariant: 'commercial',
        badge: 'Offre limitée',
        title: 'Une offre exclusive vous attend',
        subtitle: 'Stock limité — conditions exceptionnelles.',
        bodyText: 'Nos conseillers vous accompagnent pour trouver le véhicule idéal.',
        ctaLabel: 'Demander une offre',
        ctaHref: '#formulaire',
        secondaryCtaLabel: 'Découvrir le stock',
        trustStat1: 'Stock national',
        trustStat2: 'Reprise garantie',
        trustStat3: 'Livraison rapide',
        partnerLogos: 'Neuf · Occasion · Premium',
      };
    default:
      return {
        campaignVariant: 'default',
        badge: 'Offre exclusive',
        title: 'Votre campagne Auto Hall',
        subtitle: 'Découvrez nos offres et réservez en quelques clics.',
        trustStat1: '30+ marques',
        trustStat2: '50 points de vente',
        trustStat3: '1M+ clients',
        partnerLogos: 'Auto Hall · Réseau national',
      };
  }
}

export function parseHeroCampaignVariant(value: unknown): HeroCampaignVariant {
  if (
    value === 'vehicle' ||
    value === 'sav' ||
    value === 'financing' ||
    value === 'commercial' ||
    value === 'default'
  ) {
    return value;
  }
  return 'default';
}
