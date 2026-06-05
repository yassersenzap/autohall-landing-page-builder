import type { Field } from '@puckeditor/core';
import { StudioV2MediaField } from './StudioV2MediaField';

export const TYPOGRAPHY_OBJECT_FIELDS = {
  titleSize: {
    type: 'select' as const,
    label: 'Taille titre',
    options: [
      { label: 'Petit', value: 'sm' },
      { label: 'Moyen', value: 'md' },
      { label: 'Grand', value: 'lg' },
      { label: 'Très grand', value: 'xl' },
      { label: 'Hero', value: 'hero' },
    ],
  },
  titleWeight: {
    type: 'select' as const,
    label: 'Poids titre',
    options: [
      { label: 'Regular', value: 'regular' },
      { label: 'Medium', value: 'medium' },
      { label: 'Semi-bold', value: 'semibold' },
      { label: 'Bold', value: 'bold' },
      { label: 'Black', value: 'black' },
    ],
  },
  lineHeight: {
    type: 'select' as const,
    label: 'Interligne',
    options: [
      { label: 'Compact', value: 'compact' },
      { label: 'Normal', value: 'normal' },
      { label: 'Aéré', value: 'relaxed' },
    ],
  },
  letterSpacing: {
    type: 'select' as const,
    label: 'Espacement lettres',
    options: [
      { label: 'Serré', value: 'tight' },
      { label: 'Normal', value: 'normal' },
      { label: 'Large', value: 'wide' },
    ],
  },
  textAlign: {
    type: 'select' as const,
    label: 'Alignement',
    options: [
      { label: 'Gauche', value: 'left' },
      { label: 'Centré', value: 'center' },
      { label: 'Droite', value: 'right' },
    ],
  },
  textTransform: {
    type: 'select' as const,
    label: 'Transformation',
    options: [
      { label: 'Normal', value: 'normal' },
      { label: 'Majuscules', value: 'uppercase' },
    ],
  },
  titleColor: { type: 'text' as const, label: 'Couleur titre (optionnel)' },
  textColor: { type: 'text' as const, label: 'Couleur texte (optionnel)' },
};

export const IMAGE_STYLE_OBJECT_FIELDS = {
  imageFit: {
    type: 'select' as const,
    label: 'Ajustement',
    options: [
      { label: 'Couvrir', value: 'cover' },
      { label: 'Contenir', value: 'contain' },
    ],
  },
  imagePosition: {
    type: 'select' as const,
    label: 'Position',
    options: [
      { label: 'Centre', value: 'center' },
      { label: 'Haut', value: 'top' },
      { label: 'Bas', value: 'bottom' },
      { label: 'Gauche', value: 'left' },
      { label: 'Droite', value: 'right' },
    ],
  },
  aspectRatio: {
    type: 'select' as const,
    label: 'Ratio',
    options: [
      { label: 'Auto', value: 'auto' },
      { label: '16:9', value: '16:9' },
      { label: '4:3', value: '4:3' },
      { label: '1:1', value: '1:1' },
      { label: 'Portrait', value: 'portrait' },
    ],
  },
  imageRadius: {
    type: 'select' as const,
    label: 'Coins',
    options: [
      { label: 'Aucun', value: 'none' },
      { label: 'Petit', value: 'sm' },
      { label: 'Moyen', value: 'md' },
      { label: 'Grand', value: 'lg' },
      { label: 'XL', value: 'xl' },
      { label: 'Rond', value: 'full' },
    ],
  },
  imageShadow: {
    type: 'select' as const,
    label: 'Ombre',
    options: [
      { label: 'Aucune', value: 'none' },
      { label: 'Douce', value: 'soft' },
      { label: 'Moyenne', value: 'medium' },
      { label: 'Forte', value: 'strong' },
    ],
  },
  overlayOpacity: {
    type: 'number' as const,
    label: 'Opacité overlay (0–100)',
    min: 0,
    max: 100,
  },
};

export function createMediaField(imageUrlKey = 'imageUrl'): Field {
  return {
    type: 'custom',
    label: 'Visuel',
    render: ({ value, onChange, readOnly }) => (
      <StudioV2MediaField
        imageAssetId={String(value ?? '')}
        imageUrlKey={imageUrlKey}
        readOnly={readOnly}
        onChangeAssetId={(assetId) => onChange(assetId)}
      />
    ),
  };
}

export const TYPOGRAPHY_FIELD: Field = {
  type: 'object',
  label: 'Typographie',
  objectFields: TYPOGRAPHY_OBJECT_FIELDS,
};

export const IMAGE_STYLE_FIELD: Field = {
  type: 'object',
  label: 'Style image',
  objectFields: IMAGE_STYLE_OBJECT_FIELDS,
};
