export type AutoHallTargetRow = {
  id: string;
  campagne: string;
  landing: string;
  statut: 'Active' | 'Brouillon';
  version: string;
  leads: number;
  dernierExport: string;
};

export const DEMO_TABLE_ROWS: AutoHallTargetRow[] = [
  {
    id: '1',
    campagne: 'Offre printemps',
    landing: 'Page offre véhicule',
    statut: 'Active',
    version: 'v1 — 1',
    leads: 0,
    dernierExport: '—',
  },
  {
    id: '2',
    campagne: 'SAV & services',
    landing: 'Page SAV',
    statut: 'Brouillon',
    version: 'v1 — 1',
    leads: 0,
    dernierExport: '—',
  },
  {
    id: '3',
    campagne: 'Financement',
    landing: 'Page financement',
    statut: 'Brouillon',
    version: 'v1 — 1',
    leads: 0,
    dernierExport: '—',
  },
];
