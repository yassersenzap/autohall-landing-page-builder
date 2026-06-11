import type { BlockDefinition } from '../../block-registry/block-definition.types';
import type {
  HeroVehicleOfferContent,
  HeroVehicleOfferDesign,
} from './hero-vehicle-offer.types';
import { HERO_VEHICLE_OFFER_TYPE } from './hero-vehicle-offer.types';

export const heroVehicleOfferDefaultContent: HeroVehicleOfferContent = {
  brandId: 'ford',
  modelName: 'Nouveau modèle',
  headline: 'Découvrez le nouveau modèle',
  subheadline: 'Offre de lancement exclusive en concession Auto Hall',
  offerLabel: 'Offre limitée',
  priceText: 'À partir de — DH',
  primaryCtaLabel: 'Réserver un essai',
  secondaryCtaLabel: 'Voir les finitions',
  heroImage: null,
  heroImageAlt: '',
  imageFit: 'cover',
  imagePosition: 'right',
  cropPreset: 'center',
  focalPointX: 50,
  focalPointY: 50,
  overlayIntensity: 'medium',
  layoutVariant: 'split-media-right',
  mobileImage: null,
};

export const heroVehicleOfferDefaultDesign: HeroVehicleOfferDesign = {
  tone: 'brand',
  density: 'comfortable',
  ctaStyle: 'primary',
  showOfferBadge: true,
  alignContent: 'left',
};

export const heroVehicleOfferDefinition: BlockDefinition<
  typeof HERO_VEHICLE_OFFER_TYPE,
  HeroVehicleOfferContent,
  HeroVehicleOfferDesign
> = {
  type: HERO_VEHICLE_OFFER_TYPE,
  label: 'Hero offre véhicule',
  description:
    'Hero premium brand-aware : modèle, offre, prix et CTAs avec contrôle image avancé.',
  category: 'hero',
  availability: 'foundation',
  defaultContent: heroVehicleOfferDefaultContent,
  defaultDesign: heroVehicleOfferDefaultDesign,
  editableFields: [
    { key: 'brandId', label: 'Marque', fieldType: 'brand', required: true },
    { key: 'modelName', label: 'Modèle', fieldType: 'text', required: true, maxLength: 80 },
    { key: 'headline', label: 'Titre principal', fieldType: 'text', required: true, maxLength: 120 },
    {
      key: 'subheadline',
      label: 'Sous-titre',
      fieldType: 'textarea',
      maxLength: 240,
    },
    { key: 'offerLabel', label: 'Badge offre', fieldType: 'text', maxLength: 48 },
    { key: 'priceText', label: 'Prix / mention', fieldType: 'text', maxLength: 64 },
    { key: 'primaryCtaLabel', label: 'CTA principal', fieldType: 'cta', required: true },
    { key: 'secondaryCtaLabel', label: 'CTA secondaire', fieldType: 'cta' },
    { key: 'heroImageAlt', label: 'Texte alternatif image', fieldType: 'text', maxLength: 120 },
  ],
  designControls: [
    {
      key: 'tone',
      label: 'Ambiance',
      type: 'select',
      defaultValue: 'brand',
      options: [
        { value: 'light', label: 'Clair' },
        { value: 'dark', label: 'Sombre' },
        { value: 'brand', label: 'Marque' },
      ],
    },
    {
      key: 'density',
      label: 'Densité',
      type: 'select',
      defaultValue: 'comfortable',
      options: [
        { value: 'compact', label: 'Compact' },
        { value: 'comfortable', label: 'Confortable' },
        { value: 'immersive', label: 'Immersif' },
      ],
    },
    {
      key: 'ctaStyle',
      label: 'Style CTA',
      type: 'select',
      defaultValue: 'primary',
      options: [
        { value: 'primary', label: 'Plein' },
        { value: 'outline', label: 'Contour' },
        { value: 'ghost', label: 'Discret' },
      ],
    },
    {
      key: 'layoutVariant',
      label: 'Disposition',
      type: 'select',
      defaultValue: 'split-media-right',
      options: [
        { value: 'split-media-right', label: 'Média à droite' },
        { value: 'split-media-left', label: 'Média à gauche' },
        { value: 'full-bleed-overlay', label: 'Plein écran' },
        { value: 'stacked-mobile', label: 'Empilé mobile' },
      ],
    },
    {
      key: 'showOfferBadge',
      label: 'Afficher le badge offre',
      type: 'toggle',
      defaultValue: true,
    },
    {
      key: 'alignContent',
      label: 'Alignement contenu',
      type: 'segmented',
      defaultValue: 'left',
      options: [
        { value: 'left', label: 'Gauche' },
        { value: 'center', label: 'Centre' },
      ],
    },
  ],
  imageControls: [
    {
      key: 'heroImage',
      label: 'Image hero',
      fieldType: 'asset',
      defaultValue: null,
      description: 'Visuel principal desktop',
    },
    {
      key: 'mobileImage',
      label: 'Image mobile',
      fieldType: 'asset',
      defaultValue: null,
      optional: true,
      description: 'Recadrage optionnel pour mobile',
    },
    {
      key: 'imageFit',
      label: 'Ajustement',
      fieldType: 'select',
      defaultValue: 'cover',
      options: [
        { value: 'cover', label: 'Remplir (cover)' },
        { value: 'contain', label: 'Contenir (contain)' },
      ],
    },
    {
      key: 'imagePosition',
      label: 'Position image',
      fieldType: 'select',
      defaultValue: 'right',
      options: [
        { value: 'left', label: 'Gauche' },
        { value: 'right', label: 'Droite' },
        { value: 'background', label: 'Arrière-plan' },
      ],
    },
    {
      key: 'cropPreset',
      label: 'Recadrage',
      fieldType: 'select',
      defaultValue: 'center',
      options: [
        { value: 'center', label: 'Centre' },
        { value: 'left', label: 'Gauche' },
        { value: 'right', label: 'Droite' },
        { value: 'top', label: 'Haut' },
        { value: 'bottom', label: 'Bas' },
        { value: 'custom', label: 'Personnalisé' },
      ],
    },
    {
      key: 'overlayIntensity',
      label: 'Intensité overlay',
      fieldType: 'overlay',
      defaultValue: 'medium',
      options: [
        { value: 'none', label: 'Aucun' },
        { value: 'light', label: 'Léger' },
        { value: 'medium', label: 'Moyen' },
        { value: 'heavy', label: 'Fort' },
      ],
    },
  ],
  compatibleBrands: 'all',
  builderRenderer: 'HeroVehicleOfferBlockPreview',
  exportRenderer: 'hero-vehicle-offer.render',
};
