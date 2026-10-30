import type { DynamicFormField } from './form-builder.types';
import { createFormFieldId } from './form-builder.types';

// ── Form template types ────────────────────────────────────────────────────────

export type FormTemplateId = 'test_drive' | 'devis' | 'reprise' | 'sav' | 'blank';

export type FormTemplate = {
  id: FormTemplateId;
  label: string;
  icon: string;
  description: string;
  fields: DynamicFormField[];
  steps: Array<{ id: string; title: string; description: string; fieldIds: string[]; nextLabel: string; backLabel: string }>;
};

function fid() { return createFormFieldId(); }

function makeStep(id: string, title: string, description: string, fieldIds: string[], nextLabel = 'Continuer →', backLabel = 'Retour') {
  return { id, title, description, fieldIds, nextLabel, backLabel };
}

// ── Template: Essai Test Drive ────────────────────────────────────────────────

export function createTestDriveTemplate(): FormTemplate {
  const f_model = fid(), f_city = fid(), f_name = fid(), f_phone = fid(), f_consent = fid();
  return {
    id: 'test_drive',
    label: 'Essai Test Drive',
    icon: '🚗',
    description: 'Réservation d\'un essai — véhicule + ville + coordonnées',
    fields: [
      { id: f_model, type: 'select', label: 'Modèle', placeholder: 'Sélectionnez un modèle', enabled: true, required: true, width: '100%', options: ['Chery Tiggo 7 Pro PHEV', 'Chery Tiggo 4 Pro', 'Chery Tiggo 8 Pro', 'Ford Ranger', 'BYD Atto 3'] },
      { id: f_city, type: 'select', label: 'Ville', placeholder: 'Votre ville', enabled: true, required: true, width: '100%', options: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Oujda', 'Meknès'] },
      { id: f_name, type: 'text', label: 'Nom complet', placeholder: 'Votre nom et prénom', enabled: true, required: true, width: '100%' },
      { id: f_phone, type: 'phone', label: 'Téléphone', placeholder: '06 00 00 00 00', enabled: true, required: true, width: '100%' },
      { id: f_consent, type: 'checkbox', label: "J'accepte d'être contacté par Auto Hall.", enabled: true, required: true, width: '100%' },
    ],
    steps: [
      makeStep('s1', 'Votre véhicule', 'Choisissez le modèle et votre ville', [f_model, f_city]),
      makeStep('s2', 'Vos coordonnées', 'Pour vous recontacter rapidement', [f_name, f_phone, f_consent], 'Valider ma demande'),
    ],
  };
}

// ── Template: Demande de Devis ─────────────────────────────────────────────────

export function createDevisTemplate(): FormTemplate {
  const f_model = fid(), f_budget = fid(), f_name = fid(), f_phone = fid(), f_email = fid(), f_consent = fid();
  return {
    id: 'devis',
    label: 'Demande de Devis',
    icon: '📋',
    description: 'Obtenir un devis personnalisé — modèle + budget + contact',
    fields: [
      { id: f_model, type: 'select', label: 'Modèle', placeholder: 'Sélectionnez un modèle', enabled: true, required: true, width: '100%', options: ['Chery Tiggo 7 Pro PHEV', 'Chery Tiggo 4 Pro', 'Chery Tiggo 8 Pro', 'Ford Ranger', 'BYD Atto 3'] },
      { id: f_budget, type: 'select', label: 'Budget', placeholder: 'Votre budget', enabled: true, required: false, width: '100%', options: ['Moins de 200 000 Dh', '200 000 – 300 000 Dh', '300 000 – 400 000 Dh', 'Plus de 400 000 Dh'] },
      { id: f_name, type: 'text', label: 'Nom complet', placeholder: 'Votre nom et prénom', enabled: true, required: true, width: '100%' },
      { id: f_phone, type: 'phone', label: 'Téléphone', placeholder: '06 00 00 00 00', enabled: true, required: true, width: '50%' },
      { id: f_email, type: 'email', label: 'Email', placeholder: 'vous@exemple.ma', enabled: true, required: false, width: '50%' },
      { id: f_consent, type: 'checkbox', label: "J'accepte d'être contacté par Auto Hall.", enabled: true, required: true, width: '100%' },
    ],
    steps: [
      makeStep('s1', 'Votre projet', 'Quel modèle et quel budget ?', [f_model, f_budget]),
      makeStep('s2', 'Vos coordonnées', 'Pour vous envoyer le devis', [f_name, f_phone, f_email, f_consent], 'Recevoir mon devis'),
    ],
  };
}

// ── Template: Reprise ────────────────────────────────────────────────────────

export function createRepriseTemplate(): FormTemplate {
  const f_brand = fid(), f_model = fid(), f_year = fid(), f_km = fid(), f_name = fid(), f_phone = fid(), f_consent = fid();
  return {
    id: 'reprise',
    label: 'Reprise Véhicule',
    icon: '🔄',
    description: 'Estimer la reprise — marque + modèle + année + kilométrage',
    fields: [
      { id: f_brand, type: 'text', label: 'Marque', placeholder: 'Ex: Renault', enabled: true, required: true, width: '50%' },
      { id: f_model, type: 'text', label: 'Modèle', placeholder: 'Ex: Clio 4', enabled: true, required: true, width: '50%' },
      { id: f_year, type: 'select', label: 'Année', placeholder: 'Année', enabled: true, required: true, width: '50%', options: ['2024','2023','2022','2021','2020','2019','2018','2017','2016','2015','Avant 2015'] },
      { id: f_km, type: 'select', label: 'Kilométrage', placeholder: 'Km', enabled: true, required: true, width: '50%', options: ['< 30 000 km', '30 000 – 60 000 km', '60 000 – 100 000 km', '100 000 – 150 000 km', '> 150 000 km'] },
      { id: f_name, type: 'text', label: 'Nom complet', placeholder: 'Votre nom et prénom', enabled: true, required: true, width: '100%' },
      { id: f_phone, type: 'phone', label: 'Téléphone', placeholder: '06 00 00 00 00', enabled: true, required: true, width: '100%' },
      { id: f_consent, type: 'checkbox', label: "J'accepte d'être contacté par Auto Hall.", enabled: true, required: true, width: '100%' },
    ],
    steps: [
      makeStep('s1', 'Votre véhicule actuel', 'Renseignez les infos de votre voiture', [f_brand, f_model, f_year, f_km]),
      makeStep('s2', 'Vos coordonnées', 'Pour vous proposer une estimation', [f_name, f_phone, f_consent], 'Obtenir mon estimation'),
    ],
  };
}

// ── Template: SAV / Rendez-vous ───────────────────────────────────────────────

export function createSavTemplate(): FormTemplate {
  const f_vehicle = fid(), f_immat = fid(), f_city = fid(), f_date = fid(), f_name = fid(), f_phone = fid(), f_consent = fid();
  return {
    id: 'sav',
    label: 'Rendez-vous SAV',
    icon: '🔧',
    description: 'Prendre rendez-vous SAV — véhicule + concession + date + contact',
    fields: [
      { id: f_vehicle, type: 'text', label: 'Votre véhicule', placeholder: 'Ex: Chery Tiggo 7', enabled: true, required: true, width: '50%' },
      { id: f_immat, type: 'text', label: 'Immatriculation', placeholder: 'Ex: 12345-A-1', enabled: true, required: false, width: '50%' },
      { id: f_city, type: 'select', label: 'Concession', placeholder: 'Choisir', enabled: true, required: true, width: '100%', options: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès', 'Agadir', 'Oujda', 'Meknès', 'Tétouan'] },
      { id: f_date, type: 'date', label: 'Date souhaitée', placeholder: 'jj/mm/aaaa', enabled: true, required: false, width: '100%' },
      { id: f_name, type: 'text', label: 'Nom complet', placeholder: 'Votre nom et prénom', enabled: true, required: true, width: '100%' },
      { id: f_phone, type: 'phone', label: 'Téléphone', placeholder: '06 00 00 00 00', enabled: true, required: true, width: '100%' },
      { id: f_consent, type: 'checkbox', label: "J'accepte d'être contacté par Auto Hall.", enabled: true, required: true, width: '100%' },
    ],
    steps: [
      makeStep('s1', 'Votre véhicule', 'Infos du véhicule et concession', [f_vehicle, f_immat, f_city, f_date]),
      makeStep('s2', 'Vos coordonnées', 'Pour confirmer le rendez-vous', [f_name, f_phone, f_consent], 'Confirmer le RDV'),
    ],
  };
}

// ── Template: Personnalisé (blank) ────────────────────────────────────────────

export function createBlankTemplate(): FormTemplate {
  const f1 = fid();
  return {
    id: 'blank',
    label: 'Formulaire libre',
    icon: '✏️',
    description: 'Partez de zéro — ajoutez vos propres champs',
    fields: [
      { id: f1, type: 'text', label: 'Champ 1', placeholder: '', enabled: true, required: false, width: '100%' },
    ],
    steps: [
      makeStep('s1', 'Informations', '', [f1], 'Envoyer'),
    ],
  };
}

export const FORM_TEMPLATES: FormTemplate[] = [
  createTestDriveTemplate(),
  createDevisTemplate(),
  createRepriseTemplate(),
  createSavTemplate(),
  createBlankTemplate(),
];

/** Starter fields — Gamme thermique (editable, not hardcoded at render time). */
export function createThermiqueFormFields(): DynamicFormField[] {
  return [
    {
      id: createFormFieldId(),
      type: 'select',
      label: 'Modèle',
      placeholder: 'Sélectionnez un modèle',
      enabled: true,
      required: true,
      width: '100%',
      options: ['Chery Tiggo', 'Ford Ranger', 'Jeep Compass', 'Nissan Qashqai'],
    },
    {
      id: createFormFieldId(),
      type: 'select',
      label: 'Ville',
      placeholder: 'Casablanca',
      enabled: true,
      required: true,
      width: '100%',
      options: ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès'],
    },
    {
      id: createFormFieldId(),
      type: 'date',
      label: 'Date préférée pour l\'essai',
      placeholder: 'jj/mm/aaaa',
      enabled: true,
      required: false,
      width: '100%',
    },
    {
      id: createFormFieldId(),
      type: 'text',
      label: 'Nom',
      placeholder: 'Entrez votre nom',
      enabled: true,
      required: true,
      width: '100%',
    },
    {
      id: createFormFieldId(),
      type: 'phone',
      label: 'Téléphone',
      placeholder: 'Entrez votre téléphone',
      enabled: true,
      required: true,
      width: '100%',
    },
  ];
}

/** Minimal empty form for new blocks. */
export function createStarterFormFields(): DynamicFormField[] {
  return [
    {
      id: createFormFieldId(),
      type: 'text',
      label: 'Champ 1',
      placeholder: '',
      enabled: true,
      required: false,
      width: '100%',
    },
    {
      id: createFormFieldId(),
      type: 'text',
      label: 'Champ 2',
      placeholder: '',
      enabled: true,
      required: false,
      width: '100%',
    },
    {
      id: createFormFieldId(),
      type: 'text',
      label: 'Champ 3',
      placeholder: '',
      enabled: true,
      required: false,
      width: '100%',
    },
  ];
}
