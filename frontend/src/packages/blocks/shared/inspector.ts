import type { InspectorControl } from './inspector-control.types';

export function textControl(
  key: string,
  propKey: string,
  label: string,
  tab: InspectorControl['tab'] = 'content',
  multiline = false,
): InspectorControl {
  return {
    key,
    propKey,
    label,
    tab,
    type: multiline ? 'textarea' : 'text',
  };
}

export function selectControl(
  key: string,
  propKey: string,
  label: string,
  options: { value: string; label: string }[],
  tab: InspectorControl['tab'] = 'design',
): InspectorControl {
  return { key, propKey, label, tab, type: 'select', options };
}

export function boolControl(
  key: string,
  propKey: string,
  label: string,
  tab: InspectorControl['tab'] = 'content',
): InspectorControl {
  return { key, propKey, label, tab, type: 'boolean' };
}

export function imageControl(
  key: string,
  label: string,
): InspectorControl {
  return {
    key,
    propKey: 'imageAssetId',
    label,
    tab: 'design',
    type: 'asset',
    assetKey: 'imageAssetId',
    urlKey: 'imageUrl',
    altKey: 'imageAlt',
    enableFocalPicker: true,
  };
}

export function imageGeometryControls(): InspectorControl[] {
  return [
    selectControl(
      'v4-image-fit',
      'imageFit',
      'Ajustement',
      [
        { value: 'cover', label: 'Couvrir' },
        { value: 'contain', label: 'Contenir' },
      ],
      'design',
    ),
    {
      key: 'v4-image-zoom',
      propKey: 'imageZoom',
      label: 'Zoom image',
      tab: 'design',
      type: 'range',
      min: 80,
      max: 140,
      step: 1,
    },
    {
      key: 'v4-focal-x',
      propKey: 'focalPointX',
      label: 'Point focal X',
      tab: 'design',
      type: 'range',
      min: 0,
      max: 100,
      step: 1,
    },
    {
      key: 'v4-focal-y',
      propKey: 'focalPointY',
      label: 'Point focal Y',
      tab: 'design',
      type: 'range',
      min: 0,
      max: 100,
      step: 1,
    },
  ];
}

export function overlayControls(): InspectorControl[] {
  return [
    {
      key: 'v4-overlay-opacity',
      propKey: 'overlayOpacity',
      label: 'Opacité overlay',
      tab: 'design',
      type: 'range',
      min: 0,
      max: 90,
      step: 1,
    },
    {
      key: 'v4-overlay-color',
      propKey: 'overlayColor',
      label: 'Couleur overlay',
      tab: 'design',
      type: 'color',
    },
  ];
}

export function ctaControls(): InspectorControl[] {
  return [
    textControl('v4-cta-label', 'ctaLabel', 'Texte du bouton'),
    textControl('v4-cta-href', 'ctaHref', 'Lien du bouton'),
  ];
}
