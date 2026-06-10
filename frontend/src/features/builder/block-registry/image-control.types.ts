export type ImageFit = 'cover' | 'contain';

export type ImagePosition = 'left' | 'right' | 'background';

export type ImageFocalPoint = 'center' | 'left' | 'right' | 'top' | 'bottom';

export type OverlayIntensity = 'none' | 'light' | 'medium' | 'heavy';

export type ImageControlFieldType =
  | 'asset'
  | 'select'
  | 'focal-point'
  | 'overlay';

export type ImageControlOption<T extends string = string> = {
  value: T;
  label: string;
};

/**
 * Declarative image control bound to a content or design field.
 */
export type ImageControl<T extends string = string> = {
  key: string;
  label: string;
  fieldType: ImageControlFieldType;
  options?: ImageControlOption<T>[];
  defaultValue: T | null;
  optional?: boolean;
  description?: string;
};

export type ImageControlMap = Record<string, ImageControl>;

export type HeroImageFields = {
  heroImage: string | null;
  imageFit: ImageFit;
  imagePosition: ImagePosition;
  focalPoint: ImageFocalPoint;
  overlayIntensity: OverlayIntensity;
  mobileImage?: string | null;
};
