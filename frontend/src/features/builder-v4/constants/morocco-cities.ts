// Official Auto Hall network cities — kept in sync with AUTOHALL_OFFICIAL_CITIES in pro-blocks.ts.
export const MOROCCO_CITIES: readonly string[] = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fès',
  'Tanger',
  'Agadir',
  'Oujda',
  'Meknès',
  'Tétouan',
  'Salé',
  'Béni Mellal',
  'Berkane',
  'Dakhla',
  'El Jadida',
  'Errachidia',
  'Karia',
  'Kénitra',
  'Nador',
  'Tifelt',
  'Safi',
  'Sidi Kacem',
  'Taroudant',
  'Khouribga',
  'Mohammedia',
  'Ait Melloul',
  'Laâyoune',
  'Tout le royaume',
] as const;

export const CITY_FIELD_IDS = new Set(['city', 'ville', 'city-select']);

export function isCityField(fieldId: string, fieldLabel?: string): boolean {
  if (CITY_FIELD_IDS.has(fieldId.toLowerCase())) return true;
  if (fieldLabel?.toLowerCase().includes('ville')) return true;
  return false;
}
