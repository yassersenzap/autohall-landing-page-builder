import type { CollectionSchema } from './collection-field.types';

const BENTO_ICON_OPTIONS = [
  { value: 'network', label: 'Réseau' },
  { value: 'finance', label: 'Financement' },
  { value: 'shield', label: 'Garantie' },
  { value: 'drive', label: 'Essai' },
  { value: 'star', label: 'Étoile' },
];

const CTA_VARIANT_OPTIONS = [
  { value: 'primary', label: 'Principal' },
  { value: 'secondary', label: 'Secondaire' },
];

export const COLLECTION_SCHEMAS: CollectionSchema[] = [
  {
    blockType: 'premium_bento_features',
    propKey: 'cards',
    itemLabel: 'Carte',
    previewField: 'title',
    minItems: 1,
    maxItems: 8,
    addItemLabel: 'Ajouter une carte',
    emptyState: 'Aucune carte — ajoutez un avantage ou un point fort.',
    itemFields: [
      { key: 'title', type: 'text', label: 'Titre', placeholder: 'Titre de la carte' },
      { key: 'description', type: 'textarea', label: 'Description', placeholder: 'Description courte' },
      { key: 'icon', type: 'select', label: 'Icône', options: BENTO_ICON_OPTIONS, defaultValue: 'star' },
    ],
  },
  {
    blockType: 'animated_stats_strip',
    propKey: 'metrics',
    itemLabel: 'Indicateur',
    previewField: 'label',
    minItems: 1,
    maxItems: 6,
    addItemLabel: 'Ajouter un indicateur',
    emptyState: 'Ajoutez des chiffres clés ou indicateurs de confiance.',
    itemFields: [
      { key: 'value', type: 'text', label: 'Valeur', placeholder: 'ex. 50+' },
      { key: 'label', type: 'text', label: 'Libellé', placeholder: 'ex. Concessions' },
      { key: 'helper', type: 'text', label: 'Sous-texte', placeholder: 'Optionnel' },
    ],
  },
  {
    blockType: 'premium_testimonials',
    propKey: 'testimonials',
    itemLabel: 'Témoignage',
    previewField: 'author',
    minItems: 1,
    maxItems: 9,
    addItemLabel: 'Ajouter un témoignage',
    emptyState: 'Ajoutez des avis clients ou citations.',
    itemFields: [
      { key: 'quote', type: 'textarea', label: 'Citation', placeholder: 'Témoignage client' },
      { key: 'author', type: 'text', label: 'Auteur', placeholder: 'Nom du client' },
      { key: 'role', type: 'text', label: 'Rôle / ville', placeholder: 'Optionnel' },
    ],
  },
  {
    blockType: 'campaign_timeline_steps',
    propKey: 'steps',
    itemLabel: 'Étape',
    previewField: 'title',
    minItems: 1,
    maxItems: 8,
    addItemLabel: 'Ajouter une étape',
    emptyState: 'Décrivez le parcours client en étapes.',
    itemFields: [
      { key: 'title', type: 'text', label: 'Titre', placeholder: 'Titre de l’étape' },
      { key: 'description', type: 'textarea', label: 'Description', placeholder: 'Détail de l’étape' },
    ],
  },
  {
    blockType: 'vehicle_showcase_split',
    propKey: 'specs',
    itemLabel: 'Spécification',
    previewField: 'label',
    minItems: 0,
    maxItems: 8,
    addItemLabel: 'Ajouter une spec',
    emptyState: 'Ajoutez des caractéristiques véhicule (label + valeur).',
    itemFields: [
      { key: 'label', type: 'text', label: 'Libellé', placeholder: 'ex. Motorisation' },
      { key: 'value', type: 'text', label: 'Valeur', placeholder: 'ex. Hybride' },
    ],
  },
  {
    blockType: 'vehicle_showcase_split',
    propKey: 'ctas',
    itemLabel: 'Bouton',
    previewField: 'label',
    minItems: 0,
    maxItems: 3,
    addItemLabel: 'Ajouter un CTA',
    emptyState: 'Ajoutez des boutons d’action.',
    itemFields: [
      { key: 'label', type: 'text', label: 'Libellé', placeholder: 'ex. Réservez un essai' },
      { key: 'href', type: 'url', label: 'Lien', placeholder: '#lead-form' },
      { key: 'variant', type: 'select', label: 'Style', options: CTA_VARIANT_OPTIONS, defaultValue: 'primary' },
    ],
  },
  {
    blockType: 'vehicle_range',
    propKey: 'vehicles',
    itemLabel: 'Modèle',
    previewField: 'name',
    minItems: 1,
    maxItems: 9,
    addItemLabel: 'Ajouter un modèle',
    emptyState: 'Ajoutez les véhicules de la gamme.',
    itemFields: [
      { key: 'name', type: 'text', label: 'Nom', placeholder: 'Modèle' },
      { key: 'energy', type: 'text', label: 'Motorisation', placeholder: 'Thermique / Hybride…' },
      { key: 'tag', type: 'text', label: 'Badge', placeholder: 'Optionnel' },
      { key: 'imageAssetId', type: 'text', label: 'ID média', placeholder: 'Depuis le gestionnaire média' },
      { key: 'imageUrl', type: 'text', label: 'URL image', placeholder: 'Laisser vide si média lié' },
      { key: 'alt', type: 'text', label: 'Texte alternatif', placeholder: 'Description image' },
      { key: 'ctaText', type: 'text', label: 'Libellé CTA', placeholder: 'Découvrir' },
      { key: 'ctaTarget', type: 'url', label: 'Lien CTA', placeholder: '#lead-form' },
    ],
  },
  {
    blockType: 'pricing_trim',
    propKey: 'trims',
    itemLabel: 'Finition',
    previewField: 'name',
    minItems: 1,
    maxItems: 4,
    addItemLabel: 'Ajouter une finition',
    emptyState: 'Ajoutez les finitions et tarifs indicatifs.',
    itemFields: [
      { key: 'name', type: 'text', label: 'Nom', placeholder: 'ex. Business' },
      { key: 'price', type: 'text', label: 'Prix', placeholder: '— DH' },
      { key: 'buttonText', type: 'text', label: 'Bouton', placeholder: 'Choisir' },
      { key: 'featured', type: 'boolean', label: 'Mise en avant' },
      { key: 'features', type: 'string-list', label: 'Équipements', placeholder: 'Un équipement par ligne' },
    ],
  },
  {
    blockType: 'gallery',
    propKey: 'images',
    itemLabel: 'Visuel',
    previewField: 'alt',
    minItems: 0,
    maxItems: 9,
    addItemLabel: 'Ajouter une image',
    emptyState: 'Ajoutez des visuels à la galerie.',
    itemFields: [
      { key: 'imageAssetId', type: 'text', label: 'ID média', placeholder: 'Depuis le gestionnaire média' },
      { key: 'url', type: 'text', label: 'URL image', placeholder: 'Ou URL externe https://' },
      { key: 'alt', type: 'text', label: 'Texte alternatif', placeholder: 'Description de l’image' },
    ],
  },
];

const SCHEMA_INDEX = new Map<string, CollectionSchema>(
  COLLECTION_SCHEMAS.map((schema) => [`${schema.blockType}:${schema.propKey}`, schema]),
);

export function getCollectionSchema(
  blockType: string,
  propKey: string,
): CollectionSchema | undefined {
  return SCHEMA_INDEX.get(`${blockType}:${propKey}`);
}

export function getCollectionSchemasForBlock(blockType: string): CollectionSchema[] {
  return COLLECTION_SCHEMAS.filter((schema) => schema.blockType === blockType);
}
