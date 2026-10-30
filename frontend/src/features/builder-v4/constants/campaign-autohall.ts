/** Tokens mesurés sur https://www.autohall.ma/campagne/gamme-thermique */
import { HERO_FIXTURE_PATHS } from '../media/media-constants';

export const AUTOHALL_CAMPAIGN = {
  imageUrl: HERO_FIXTURE_PATHS.chery,
  imageAlt: 'Chery Gamme Thermique',
  pageBackground: '#f2f2f2',
  formColumnWidth: 420,
  formCardRadius: 10,
  formCardBackground: '#ffffff',
  primaryColor: '#0d6efd',
  progressTrack: '#e9ecef',
  textPrimary: '#212529',
  textSecondary: '#6c757d',
  labelColor: '#212529',
  inputBorder: '#ced4da',
  inputRadius: 6,
  inputHeight: 38,
  breakpointStack: 900,
} as const;

export const AUTOHALL_FORM_STEP_1 = {
  stepNumber: 'Étape 1/3',
  stepTitle: 'Sélectionnez le véhicule que vous souhaitez essayer',
  stepDescription:
    'Sélectionnez le type de véhicule souhaité. Vous pourrez toujours essayer d\'autres véhicules chez votre concessionnaire.',
  progressPercent: 25,
  submitLabel: 'Suivant',
  modelPlaceholder: 'CHERY TIGGO 4 CROSS HEV',
} as const;
