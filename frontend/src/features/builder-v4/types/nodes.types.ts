export type NodeKind =
  | 'frame'
  | 'stack'
  | 'text'
  | 'image'
  | 'button'
  | 'form'
  | 'card'
  | 'section'
  | 'input';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type NodeVisibility = {
  hidden?: boolean;
  locked?: boolean;
};

export type NodeLayout = {
  display?: 'flex' | 'grid' | 'block';
  direction?: 'row' | 'column';
  columns?: string;
  rows?: string;
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'stretch';
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
  padding?: number;
  minHeight?: number | string;
  width?: number | string;
  height?: number | string;
  flex?: number | string;
  position?: 'relative' | 'absolute' | 'static';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;
  overflow?: 'hidden' | 'visible' | 'auto';
  gridColumn?: string;
  gridRow?: string;
  maxWidth?: number | string;
  minWidth?: number | string;
  maxHeight?: number | string;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  pointerEvents?: 'none' | 'auto';
};

export type NodeStyle = {
  background?: string;
  backgroundGradient?: string;
  color?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  objectFit?: 'cover' | 'contain' | 'fill';
  objectPositionX?: number;
  objectPositionY?: number;
  scale?: number;
  shadow?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowSpread?: number;
  shadowColor?: string;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  blur?: number;
  backdropBlur?: number;
  brightness?: number;
  saturation?: number;
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: number;
};

export type NodeAdvanced = {
  cssVariables?: string;
  customClass?: string;
};

export type ResponsiveSlot = {
  layout?: Partial<NodeLayout>;
  style?: Partial<NodeStyle>;
  hidden?: boolean;
};

export type NodeResponsive = {
  tablet?: ResponsiveSlot;
  mobile?: ResponsiveSlot;
};

export type FormFieldId = string;

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'textarea';

export type FormFieldWidth = '50%' | '100%';

export type FormStepConfig = {
  id: string;
  title: string;
  description?: string;
  fieldIds: FormFieldId[];
  progressColor?: string;
  icon?: string;
  nextLabel?: string;
  backLabel?: string;
  showProgress?: boolean;
  templateId?: string;
  kind?: 'form' | 'confirmation';
};

export type FormFieldConfig = {
  id: FormFieldId;
  type?: FormFieldType;
  label: string;
  placeholder?: string;
  enabled: boolean;
  required: boolean;
  width?: FormFieldWidth;
  options?: string[];
  regex?: string;
  errorMessage?: string;
  defaultValue?: string;
  tooltip?: string;
  icon?: string;
  description?: string;
  min?: string;
  max?: string;
};

export type HeroBenefit = {
  id: string;
  icon?: string;
  title: string;
  description?: string;
  color?: string;
  enabled?: boolean;
};

export type HeroTrustBadge = {
  id: string;
  text: string;
  icon?: string;
  enabled?: boolean;
};

export type FormNodeProps = {
  variant?: 'default' | 'dynamic' | 'autohall-campaign' | 'campaign';
  title: string;
  subtitle: string;
  stepTitle?: string;
  stepDescription?: string;
  progressPercent?: number;
  showProgress?: boolean;
  submitLabel: string;
  backLabel?: string;
  consentLabel: string;
  stepCount: number;
  currentStepLabel: string;
  showConsent: boolean;
  fields: FormFieldConfig[];
  /** Multi-step campaign form — aligned with autohall.ma landing pages. */
  steps?: FormStepConfig[];
  /** Builder canvas — which step is previewed (0-based). */
  previewStepIndex?: number;
  /** Legacy autohall-campaign variant — subset of field ids shown on current step. */
  activeStepFieldIds?: string[];
  cardRadius?: number;
  cardBackground?: string;
  cardShadow?: boolean;
  cardSpacing?: number;
  accentColor?: string;
  textColor?: string;
  fieldBackground?: string;
  successMessage?: string;
  thankYouPage?: string;
  redirectUrl?: string;
  // legacy/compatibility optional props
  formTitle?: string;
  formSubtitle?: string;
  submitText?: string;
  formSteps?: FormStepConfig[];
  formConfig?: Record<string, unknown>;
  customClass?: string;
  loadingMessage?: string;
  errorMessage?: string;
  showConfetti?: boolean;
  autoReset?: boolean;
  autoResetDelay?: number;
};

export type CardNodeProps = {
  elevation?: 'none' | 'sm' | 'md' | 'lg';
};

import type { HeroRootGeometry } from './geometry.types.js';

export type HeroFormGeometry = {
  mode: 'split' | 'floating-card' | 'overlay';
  leftRatio: number;
  rightRatio: number;
  minHeight?: number;
  formColumnMode?: 'ratio' | 'fixed';
  formColumnWidth?: number;
  contentHorizontal?: 'left' | 'center' | 'right';
  contentVertical?: 'top' | 'center' | 'bottom';
  contentMaxWidth?: number;
  gap?: number;
  padding?: number;
};

export type FrameNodeProps = {
  label?: string;
  theme?: 'autohall-gamme-thermique';
  blankShell?: boolean;
  /** @deprecated use heroFormGeometry */
  heroGeometry?: HeroRootGeometry;
  heroFormGeometry?: HeroFormGeometry;
  // Marketing column — left side content
  heroBenefits?: HeroBenefit[];
  heroLogoSrc?: string;
  heroLogoAssetId?: string;
  heroEyebrow?: string;
  heroPrice?: string;
  heroPriceLabel?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaUrl?: string;
  heroTrustBadges?: HeroTrustBadge[];
  // Visibility toggles
  heroShowLogo?: boolean;
  heroShowEyebrow?: boolean;
  heroShowPrice?: boolean;
  heroShowBenefits?: boolean;
  heroShowSecondaryCta?: boolean;
  heroShowTrustBadges?: boolean;
};

export type StackNodeProps = {
  label?: string;
  /** P5.8 — anchor preset within HeroSafeArea (no free drag) */
  contentAnchor?: import('./geometry.types.js').HeroContentAnchor;
  contentOffsetX?: number;
  contentOffsetY?: number;
  /** Auto scrim behind text block for readability over busy images */
  smartBackdrop?: boolean;
  backdropOpacity?: number;
  contentVerticalAlign?: 'top' | 'center' | 'bottom';
  contentHorizontalAlign?: 'left' | 'center' | 'right';
};

export type SectionNodeProps = {
  label?: string;
  htmlId?: string;
  blockType?: string;
  [key: string]: any;
};

export type InputNodeProps = {
  label: string;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'tel' | 'number';
  required?: boolean;
};

export type TextNodeProps = {
  text: string;
  content?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  editable?: boolean;
  typographyToken?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
};

export type ImageNodeProps = {
  src: string;
  alt?: string;
  fit?: 'cover' | 'contain' | 'fill';
  assetId?: string;
  imageBehavior?: 'campaign-poster' | 'background' | 'smart-crop';
  showMarketingContent?: boolean;
  overlayEnabled?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  overlayGradient?: boolean;
  overlayDirection?: string;
  overlayBlendMode?: string;
  // Focus point (0-100)
  focusX?: number;
  focusY?: number;
  // Mobile-specific image
  mobileSrc?: string;
  mobileAssetId?: string;
  // Position mode
  position?: 'cover' | 'contain' | 'original';
};

export type ButtonNodeProps = {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | string;
  href?: string;
  customClass?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconLeft?: string;
  iconRight?: string;
  animation?: 'none' | 'pulse' | 'bounce' | 'shimmer';
  hoverBackground?: string;
  hoverColor?: string;
  borderRadius?: number;
};

export type NodePropsByKind = {
  frame: FrameNodeProps;
  stack: StackNodeProps;
  text: TextNodeProps;
  image: ImageNodeProps;
  button: ButtonNodeProps;
  form: FormNodeProps;
  card: CardNodeProps;
  section: SectionNodeProps;
  input: InputNodeProps;
};

export type BuilderNode<K extends NodeKind = NodeKind> = {
  id: string;
  kind: K;
  name: string;
  children: string[];
  parentId: string | null;
  props: NodePropsByKind[K];
  style: NodeStyle;
  layout: NodeLayout;
  responsive: NodeResponsive;
  visibility: NodeVisibility;
  advanced?: NodeAdvanced;
};

export type BuilderDocument = {
  version: 4;
  rootId: string;
  nodes: Record<string, BuilderNode>;
  meta: {
    title: string;
    templateId?: string;
    brandTheme?: string;
    customPrimaryColor?: string;
    customSecondaryColor?: string;
    customButtonRadius?: string;
    customFontFamily?: string;
    /** Contexte de la page : catalogue multi-modèles ('brand') ou fiche d'un seul modèle ('model'). */
    landingPageType?: 'brand' | 'model';
    /** Marque Auto Hall active — clé de `@/config/brands`. */
    selectedBrandId?: string | null;
    /** Modèle actif quand `landingPageType === 'model'` (ex: "Ford Kuga"). */
    selectedModelName?: string | null;
    /** Balise <title> et meta description injectées dans le <head> exporté/publié. */
    seoTitle?: string;
    seoDescription?: string;
    /** Scripts personnalisés (GTM, Meta Pixel...) injectés tels quels dans le <head>. */
    headScripts?: string;
  };
};

export type BuilderTemplateId = 'campaign-hero-form';

export function isContainerKind(kind: NodeKind): boolean {
  return kind === 'frame' || kind === 'stack' || kind === 'card' || kind === 'section';
}

export function emptyStyle(): NodeStyle {
  return {};
}

export function emptyLayout(): NodeLayout {
  return {};
}

export function emptyResponsive(): NodeResponsive {
  return {};
}

export function emptyVisibility(): NodeVisibility {
  return { hidden: false, locked: false };
}
