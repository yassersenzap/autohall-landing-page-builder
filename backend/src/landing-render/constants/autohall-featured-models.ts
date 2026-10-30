export type AutoHallFeaturedModel = {
  value: string;
  label: string;
  strikePrice: string;
  priceLabel: string;
};

/** Modèles phares — campagnes type Chery TIGGO POUR TOUS. */
export const AUTOHALL_FEATURED_MODELS: AutoHallFeaturedModel[] = [
  {
    value: 'tiggo-4-pro',
    label: 'Tiggo 4 Pro',
    strikePrice: '249 900 DH',
    priceLabel: 'À partir de 219 900 DH',
  },
  {
    value: 'tiggo-7-pro',
    label: 'Tiggo 7 Pro',
    strikePrice: '329 900 DH',
    priceLabel: 'À partir de 289 900 DH',
  },
  {
    value: 'tiggo-8',
    label: 'Tiggo 8',
    strikePrice: '399 900 DH',
    priceLabel: 'À partir de 349 900 DH',
  },
  {
    value: 'tiggo-8-pro',
    label: 'Tiggo 8 Pro',
    strikePrice: '449 900 DH',
    priceLabel: 'À partir de 399 900 DH',
  },
];
