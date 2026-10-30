/**
 * Registre central des marques du groupe Auto Hall — source de vérité unique
 * pour le Builder (presets Hero, logos dynamiques, palette de couleurs, liste
 * des modèles par marque pour le formulaire multi-étapes).
 *
 * Pour ajouter/retirer une marque, éditer uniquement le tableau `AUTOHALL_BRANDS`
 * ci-dessous — aucun changement de code n'est requis dans les composants qui
 * le consomment (sélecteur de marque, blocs Hero, Specs Showroom, export ZIP...).
 */

export type AutoHallBrandId = string;

export type AutoHallBrand = {
  id: AutoHallBrandId;
  name: string;
  /** Logo officiel — chemin relatif servi par le front (ou upload manuel si absent). */
  logo: string | null;
  primaryColor: string;
  secondaryColor: string;
  /** Gamme de modèles proposée par la marque (alimente l'Étape 1 du formulaire en mode "Landing de Marque"). */
  models: string[];
  /** Marques distribuées via un site tiers (hors formulaire de lead Auto Hall). */
  externalUrl?: string;
};

export const AUTOHALL_BRANDS: AutoHallBrand[] = [
  {
    id: 'ford',
    name: 'Ford',
    logo: '/assets/logos/ford.svg',
    primaryColor: '#002C6C',
    secondaryColor: '#1b7ac8',
    models: ['Ford Kuga', 'Ford Ranger Next-Gen', 'Ford Tourneo Custom', 'Ford Transit 2T', 'Ford Territory'],
  },
  {
    id: 'opel',
    name: 'Opel',
    logo: '/assets/logos/opel.svg',
    primaryColor: '#000000',
    secondaryColor: '#ffdf00',
    models: ['Opel Grandland', 'Opel Corsa', 'Opel Astra', 'Nouvel Opel Mokka', 'Opel Movano', 'Opel Frontera'],
  },
  {
    id: 'chery',
    name: 'Chery',
    logo: '/assets/logos/chery.svg',
    primaryColor: '#7a1c32',
    secondaryColor: '#8b1e3f',
    models: ['CHERY TIGGO 4 CROSS HEV', 'CHERY TIGGO 7 PRO PHEV', 'CHERY TIGGO 8 PHEV', 'CHERY TIGGO 3X', 'CHERY TIGGO ARRIZO 6'],
  },
  {
    id: 'nissan',
    name: 'Nissan',
    logo: '/assets/logos/nissan.svg',
    primaryColor: '#c3002f',
    secondaryColor: '#111111',
    models: ['Nissan Juke', 'Nissan Qashqai e-POWER', 'Nissan Magnite'],
  },
  {
    id: 'fiat',
    name: 'Fiat',
    logo: '/assets/logos/fiat.svg',
    primaryColor: '#8c1d25',
    secondaryColor: '#222222',
    models: ['FIAT TIPO Sedan', 'FIAT 500X', 'FIAT 500e', 'FIAT DOBLÒ', 'FIAT TOPOLINO'],
  },
  {
    id: 'jeep',
    name: 'Jeep',
    logo: '/assets/logos/jeep.svg',
    primaryColor: '#1d2a1d',
    secondaryColor: '#444444',
    models: ['Jeep Grand Cherokee L', 'Jeep Avenger', 'Jeep Compass e-Hybrid', 'Jeep Wrangler 4xe'],
  },
  {
    id: 'alfa-romeo',
    name: 'Alfa Romeo',
    logo: '/assets/logos/alfa-romeo.svg',
    primaryColor: '#9b111e',
    secondaryColor: '#0d5c3a',
    models: ['Alfa Romeo Tonale', 'Alfa Romeo Junior Ibrida', 'Alfa Romeo Giulia', 'Alfa Romeo Stelvio'],
  },
  {
    id: 'seres',
    name: 'Seres',
    logo: '/assets/logos/seres.svg',
    primaryColor: '#0056b3',
    secondaryColor: '#003366',
    models: ['SERES 3', 'SERES 5'],
  },
  {
    id: 'dfsk',
    name: 'DFSK',
    logo: '/assets/logos/dfsk.svg',
    primaryColor: '#0a4da2',
    secondaryColor: '#e31b23',
    models: ['DFSK C5', 'DFSK K01S', 'DFSK K01III', 'DFSK EC31', 'DFSK EC35'],
  },
  {
    id: 'mitsubishi',
    name: 'Mitsubishi',
    logo: '/assets/logos/mitsubishi.svg',
    primaryColor: '#e60012',
    secondaryColor: '#222222',
    models: ['Mitsubishi L200 Simple Cabine', 'Mitsubishi L200 Double Cabine'],
  },
  {
    id: 'fuso',
    name: 'FUSO',
    logo: '/assets/logos/fuso.svg',
    primaryColor: '#e52321',
    secondaryColor: '#333333',
    models: ['FUSO CANTER', 'FUSO FIGHTER'],
  },
  {
    id: 'foton',
    name: 'Foton',
    logo: '/assets/logos/foton.svg',
    primaryColor: '#005ea6',
    secondaryColor: '#555555',
    models: ['FOTON AUMARK', 'FOTON TM', 'FOTON WONDER'],
  },
  {
    id: 'gaz',
    name: 'Gaz',
    logo: '/assets/logos/gaz.svg',
    primaryColor: '#0c2340',
    secondaryColor: '#1d252d',
    models: ['VAN GAZelle NEXT', 'Camion Plateau GAZelle Next'],
  },
  {
    id: 'ford-trucks',
    name: 'Ford Trucks',
    logo: '/assets/logos/ford-trucks.svg',
    primaryColor: '#0033a0',
    secondaryColor: '#001a57',
    models: [
      'Ford Trucks 1833DC',
      'Ford Trucks 1833LR',
      'Ford Trucks 2533HR',
      'Ford Trucks 3542D',
      'Ford Trucks 4142D',
      'Ford Trucks 1842T',
      'Ford Trucks F-MAX',
    ],
  },
  {
    id: 'maserati',
    name: 'Maserati',
    logo: '/assets/logos/maserati.svg',
    primaryColor: '#0c1c24',
    secondaryColor: '#003366',
    externalUrl: 'https://www.maserati.com/ma/fr',
    models: ['Grecale', 'Levante', 'Ghibli', 'Quattroporte', 'GranTurismo', 'MC20'],
  },
  {
    id: 'industriel-agricole',
    name: 'Industriel & Agricole',
    logo: '/assets/logos/case.svg',
    primaryColor: '#f07d00',
    secondaryColor: '#222222',
    externalUrl: 'https://www.case.ma/',
    models: ['CASE Chargeuse Pelleteuse 570T', 'CASE Mini-Pelle', 'CASE Tracteur Agricole', 'Somma Matériel Industriel'],
  },
];

export function getAutoHallBrand(id: AutoHallBrandId | null | undefined): AutoHallBrand | undefined {
  if (!id) return undefined;
  return AUTOHALL_BRANDS.find((brand) => brand.id === id);
}
