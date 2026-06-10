export type {
  BlockAvailability,
  BlockDefinition,
  EditableField,
  EditableFieldType,
  PremiumBlockCategory,
} from './block-definition.types';
export type {
  DesignControl,
  DesignControlMap,
  DesignControlOption,
  DesignControlType,
} from './design-control.types';
export type {
  HeroImageFields,
  ImageControl,
  ImageControlFieldType,
  ImageControlMap,
  ImageControlOption,
  ImageFit,
  ImageFocalPoint,
  ImagePosition,
  OverlayIntensity,
} from './image-control.types';
export {
  getAllPremiumBlockDefinitions,
  getPremiumBlockDefinition,
  getPremiumBlocksByCategory,
  hasPremiumBlockDefinition,
  registerBlockDefinition,
} from './block-registry';
