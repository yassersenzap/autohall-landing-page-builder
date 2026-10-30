/**
 * Pro block library — canvas insertion helpers.
 * Each block inserts a section node with blockType + typed props.
 * Rendered by ProBlockView in NodeViews.
 */
import type { BuilderDocument, BuilderNode } from '../types/nodes.types';
import { CGT_DEFAULT_BANNER } from '../canvas/blocks/campaign-gamme-thermique.shared';
import { createNode } from './node-factory';

// ── Official Auto Hall city network (immuable — source of truth) ───────────
// ⚠️  Do NOT edit this list manually. It reflects the official network at
//    https://www.autohall.ma/fr/reseau and must stay in sync with the CRM.
export const AUTOHALL_OFFICIAL_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Oujda',
  'Meknès', 'Tétouan', 'Salé', 'Béni Mellal', 'Berkane', 'Dakhla',
  'El Jadida', 'Errachidia', 'Karia', 'Kénitra', 'Nador', 'Tifelt',
  'Safi', 'Sidi Kacem', 'Taroudant', 'Khouribga',
  'Mohammedia', 'Ait Melloul', 'Laâyoune', 'Tout le royaume',
] as const satisfies readonly string[];

export type AutoHallCity = (typeof AUTOHALL_OFFICIAL_CITIES)[number];

/**
 * Returns true when the provided list is identical (order + content)
 * to the official Auto Hall city reference.
 */
export function isVillesListSynced(list: string[]): boolean {
  if (list.length !== AUTOHALL_OFFICIAL_CITIES.length) return false;
  return list.every((v, i) => v === AUTOHALL_OFFICIAL_CITIES[i]);
}

// ── Pro block prop types ────────────────────────────────────────────────────

export type BrandNavbarLink = { id: string; label: string; href: string };

export type BrandNavbarBlockProps = {
  blockType: 'brand-navbar';
  brand: string;
  logoUrl: string | null;
  altText: string;
  navLinks: BrandNavbarLink[];
  sticky: boolean;
  phoneNumber?: string;
  contactHref?: string;
  brandLogo?: string | null;

  // Modernization additions
  contactLabel?: string;
  contactBgColor?: string;
  contactTextColor?: string;

  // Retrocompatibility fields
  logoSrc?: string;
  links?: BrandNavbarLink[];
  showLinks?: boolean;
};

// No old hero-showroom props here anymore

export type SpecItem = {
  label: string;
  value: string;
  icon: string;
  hidden?: boolean;
};

export type SpecsGridBlockProps = {
  blockType: 'specs-grid';
  title?: string;
  specs: SpecItem[];
  columns: 2 | 3 | 4;
};

/**
 * Model Showcase Gallery — réplique de la section `gallery-container-modele` officielle
 * Auto Hall : 1 image principale (gauche, large) + 4 vignettes (droite, mosaïque 2x2).
 * Les 5 champs sont volontairement fixes (pas un tableau libre) pour coller à l'agencement
 * exact du site officiel et exposer 5 contrôles indépendants dans le panneau CONTENU.
 */
/** Arrondi des angles — Faible (rounded-md), Moyen (rounded-xl), Fort (rounded-3xl). */
export type ModelShowcaseGalleryRadius = 'sm' | 'md' | 'lg';

/** Espacement entre les photos — Compact (gap-1), Standard (gap-2), Large (gap-4). */
export type ModelShowcaseGalleryGap = 'compact' | 'standard' | 'large';

export type ModelShowcaseGalleryBlockProps = {
  blockType: 'model-showcase-gallery';
  mainImage: string;
  mainImageAlt: string;
  thumbImage1: string;
  thumbImage1Alt: string;
  thumbImage2: string;
  thumbImage2Alt: string;
  thumbImage3: string;
  thumbImage3Alt: string;
  thumbImage4: string;
  thumbImage4Alt: string;
  /** Libellé du bouton flottant sur l'image principale (ex: "Afficher toutes les photos"). */
  buttonText: string;
  /** Onglet DESIGN — arrondi des angles de toutes les vignettes. */
  borderRadius?: ModelShowcaseGalleryRadius;
  /** Onglet DESIGN — espacement entre les photos de la grille. */
  gap?: ModelShowcaseGalleryGap;
};

export type BenefitItem = {
  id: string;
  text: string;
  enabled: boolean;
};

export type ConversionFormSplitBlockProps = {
  blockType: 'conversion-form-split';
  benefitsTitle: string;
  benefits: BenefitItem[];
  guaranteeText: string;
  showModel: boolean;
  showCity: boolean;
  showDate: boolean;
  showName: boolean;
  showPhone: boolean;
  gdprConsent: string;
  ctaLabel: string;
  accentColor?: string;
};


/** Bascule entre le parcours d'essai routier en 3 étapes et une capture de lead directe en 1 étape. */
export type HeroConversionFormMode = 'multi-step' | 'single-step';

/** Position du formulaire dans le bloc Mosaic (à côté ou en dessous de la galerie). */
export type HeroMosaicFormLayout = 'side' | 'below';

/** Hauteur minimale du bloc Cinematic. */
export type HeroCinematicMinHeight = '80vh' | 'screen';

/** Style visuel de la carte formulaire Cinematic. */
export type HeroCinematicFormCardStyle = 'glass' | 'solid';

/** Type de média affiché dans la zone visuelle du bloc (agnostique du type de bloc). */
export type HeroMediaType = 'image' | 'gallery' | 'video';

/**
 * Base partagée par les 3 blocs Hero & Conversion premium
 * (hero-showroom, hero-mosaic, hero-cinematic).
 */
export type HeroConversionBaseProps = {
  // Onglet CONTENU
  badgeText: string;
  title: string;
  description: string;
  priceAppel: string;
  autoHallApiUrl: string;
  syncToAutoHallBase: boolean;
  modelsList: string[];
  villesList: string[];
  /** Clé de la marque Auto Hall sélectionnée dans le registre `@/config/brands` (null = aucune marque / logo custom). */
  brandKey?: string | null;
  /** Logo de la marque injecté par le preset de marque (ou upload manuel) — affiché au-dessus du badge. */
  brandLogoUrl?: string | null;

  // Formulaire
  /** 'multi-step' = parcours Modèle → Ville/Date → Coordonnées. 'single-step' = capture directe (Nom + Téléphone). */
  formMode: HeroConversionFormMode;
  singleStepTitle?: string;

  // Onglet DISPOSITION & MÉDIAS
  studioPreviewStep: 1 | 2 | 3;
  vehicleImage: string | null;
  detailImage1?: string | null;
  detailImage2?: string | null;
  detailImage3?: string | null;
  bgVideoUrl?: string | null;
  /** Type de média affiché : image unique, galerie mosaïque (4 images) ou vidéo d'arrière-plan. */
  mediaType?: HeroMediaType;
  /** Inverse la disposition en grille : contenu/média à gauche ↔ formulaire à droite (et inversement). */
  layoutReversed?: boolean;
  /** Mosaic uniquement — formulaire à droite ou en dessous de la galerie. */
  mosaicFormLayout?: HeroMosaicFormLayout;
  /** Cinematic uniquement — hauteur viewport de la section. */
  cinematicMinHeight?: HeroCinematicMinHeight;
  /** Cinematic uniquement — carte floue (glass) ou blanche contrastée (solid). */
  formCardStyle?: HeroCinematicFormCardStyle;
  paddingTop: number;
  paddingBottom: number;

  // Onglet DESIGN SYSTEM
  colorPrimary: string;
  colorSecondary: string;
  colorText: string;
  colorBgSection: string;
  borderRadiusButtons: number;
  bgOverlayOpacity: number;
  step1Title?: string;
  step2Title?: string;
  step3Title?: string;
  btnNextLabel?: string;
  btnBackLabel?: string;
  btnSubmitLabel?: string;
};

export type HeroShowroomProps = HeroConversionBaseProps & { blockType: 'hero-showroom' };
export type HeroMosaicProps = HeroConversionBaseProps & { blockType: 'hero-mosaic' };
export type HeroCinematicProps = HeroConversionBaseProps & { blockType: 'hero-cinematic' };

/** Union typée des 3 blocs Hero & Conversion. */
export type HeroConversionProps = HeroShowroomProps | HeroMosaicProps | HeroCinematicProps;

/**
 * Placeholder visuel neutre (SVG inline, aucune requête réseau) utilisé tant qu'aucune image
 * de véhicule n'a été choisie — évite tout visuel de marque codé en dur dans le squelette.
 */
export const NEUTRAL_VEHICLE_PLACEHOLDER =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">` +
      `<rect width="800" height="500" fill="#e2e8f0"/>` +
      `<g fill="none" stroke="#94a3b8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M120 320 L170 230 Q190 205 225 205 L575 205 Q610 205 630 230 L680 320"/>` +
      `<rect x="90" y="320" width="620" height="70" rx="18"/>` +
      `<circle cx="220" cy="392" r="34"/><circle cx="580" cy="392" r="34"/>` +
      `</g>` +
      `<text x="400" y="450" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle">` +
      `Image du véhicule` +
      `</text>` +
      `</svg>`,
  );

// Les presets de marques Auto Hall (palette de couleurs officielle + logo) vivent désormais
// dans un registre central et évolutif : voir `@/config/brands` (AUTOHALL_BRANDS).

export type CarouselItem = {
  title: string;
  src: string;
  category?: string;
  button?: string;
};

export type CarouselBlockProps = {
  blockType: 'carousel';
  items: CarouselItem[];
};

/** Clé d'icône vectorielle prête à l'emploi — correspond au nom exact du composant lucide-react. */
export type FinitionIconPresetKey = 'Zap' | 'ShipWheel' | 'Shield' | 'Monitor' | 'Armchair' | 'Leaf' | 'Gauge' | 'Calendar' | 'Cpu' | 'Battery' | 'Thermometer';

export const FINITION_ICON_PRESETS: { key: FinitionIconPresetKey; label: string }[] = [
  { key: 'Zap', label: 'Moteur / Hybride' },
  { key: 'ShipWheel', label: 'Volant / Direction' },
  { key: 'Shield', label: 'Sécurité' },
  { key: 'Monitor', label: 'Cockpit / Écran' },
  { key: 'Armchair', label: 'Confort / Siège' },
  { key: 'Leaf', label: 'Écologie / Hybride' },
  { key: 'Gauge', label: 'Performance / Compteur' },
  { key: 'Calendar', label: 'Autonomie / Batterie' },
  { key: 'Cpu', label: 'Technologie / Puce' },
  { key: 'Battery', label: 'Batterie / Autonomie' },
  { key: 'Thermometer', label: 'Climatisation / Thermique' },
];

/** Sous-ensemble curé pour la grille compacte des puces "Caractéristiques Clés" (Model Identity Showroom). */
export const SPEC_KEY_FEATURE_ICON_PRESETS: { key: FinitionIconPresetKey; label: string }[] = [
  { key: 'ShipWheel', label: 'Volant' },
  { key: 'Zap', label: 'Éclair' },
  { key: 'Cpu', label: 'Moteur' },
  { key: 'Battery', label: 'Batterie' },
  { key: 'Leaf', label: 'Éco' },
  { key: 'Thermometer', label: 'Thermomètre' },
];

export type FinitionOption = {
  label: string;
  /** Icône vectorielle prête à l'emploi (nom de composant lucide-react). */
  iconPreset?: FinitionIconPresetKey;
  /** Image personnalisée (upload) — prioritaire sur iconPreset si définie. */
  icon?: string;
};

export type FinitionItem = {
  name: string;
  desc: string;
  options: FinitionOption[];
  pdfUrl: string;
};

/** Puce de caractéristique technique (icône + texte court) affichée sous la description du modèle. */
export type SpecKeyFeature = {
  text: string;
  iconPreset?: FinitionIconPresetKey;
  icon?: string;
};

export type SpecsShowroomBlockProps = {
  blockType: 'specs-showroom';
  title: string;
  /** Logo manuel — prioritaire uniquement si aucune marque n'est sélectionnée au niveau de la page (`document.meta.selectedBrandId`). */
  logoUrl: string | null;
  description: string;
  priceAppel: string;
  ctaLabel: string;
  finitions: FinitionItem[];
  /** Liste de puces techniques (icône + texte) — équivalent de la rangée "modele_liste_options" de la fiche officielle. */
  keyFeatures?: SpecKeyFeature[];
  /** Couleur d'accent manuelle — prioritaire uniquement si aucune marque n'est sélectionnée au niveau de la page. */
  colorPrimary?: string;
  /** Mentions légales affichées sous le prix (ex: "*Photos non contractuelles") */
  legalMentions?: string[];
  /** Indique s'il faut afficher la carte de prix latérale (DESIGN) */
  showPriceCard?: boolean;
};

export type ContactFieldId = 'nom' | 'email' | 'telephone' | 'ville' | 'message';

export type ContactFormField = {
  id: ContactFieldId;
  label: string;
  enabled: boolean;
  required: boolean;
  placeholder: string;
};

export type ContactSectionBlockProps = {
  blockType: 'contact-section';
  title: string;
  subtitle: string;
  imageUrl: string | null;
  submitLabel: string;
  villesList: string[];
  accentColor?: string;
  bgColor?: string;
  fields?: ContactFormField[];
};

export const DEFAULT_CONTACT_FIELDS: ContactFormField[] = [
  { id: 'nom', label: 'Nom et prénom', enabled: true, required: true, placeholder: 'Nom complet' },
  { id: 'email', label: 'Email', enabled: true, required: true, placeholder: 'adresse@mail.com' },
  { id: 'telephone', label: 'Téléphone', enabled: true, required: true, placeholder: '06 00 00 00 00' },
  { id: 'ville', label: 'Ville', enabled: true, required: true, placeholder: 'Sélectionnez votre ville' },
  { id: 'message', label: 'Message', enabled: true, required: true, placeholder: 'Tapez votre message...' },
];

export type FooterSocialLinks = {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
};

export type FooterLegalLinks = {
  mentionsLegales?: string;
  politiqueConfidentialite?: string;
  conditionsService?: string;
  parametresCookies?: string;
};

export type FooterBlockProps = {
  blockType: 'footer-block';
  /** Texte du filigrane géant en arrière-plan (casse officielle: "Auto Hall"). */
  watermarkText: string;
  socialLinks: FooterSocialLinks;
  legalLinks: FooterLegalLinks;
  /** Texte de copyright — le jeton {year} est remplacé dynamiquement par l'année en cours. */
  copyrightText: string;
  bgColor?: string;

  // New column content configuration
  groupTitle?: string;
  groupLink1Label?: string;
  groupLink1Url?: string;
  groupLink2Label?: string;
  groupLink2Url?: string;
  groupLink3Label?: string;
  groupLink3Url?: string;

  servicesTitle?: string;
  servicesLink1Label?: string;
  servicesLink1Url?: string;
  servicesLink2Label?: string;
  servicesLink2Url?: string;
  servicesLink3Label?: string;
  servicesLink3Url?: string;

  careersTitle?: string;
  careersLink1Label?: string;
  careersLink1Url?: string;
  careersLink2Label?: string;
  careersLink2Url?: string;
  careersLink3Label?: string;
  careersLink3Url?: string;

  // Switches
  showBrandsColumn?: boolean;
  showCareersColumn?: boolean;
};

export const DEFAULT_FOOTER_BLOCK: FooterBlockProps = {
  blockType: 'footer-block',
  watermarkText: 'Auto Hall',
  socialLinks: {
    facebook: 'https://www.facebook.com/groupeautohall',
    instagram: 'https://www.instagram.com/groupeautohall',
    linkedin: 'https://www.linkedin.com/company/groupe-auto-hall/',
    youtube: 'https://www.youtube.com/channel/UCoIaLGxCBF1PbW5AiDU55jA/videos',
  },
  legalLinks: {
    mentionsLegales: 'https://www.autohall.ma/fr/page/mentions-legales',
    politiqueConfidentialite: 'https://www.autohall.ma/fr/page/politique-de-confidentialite',
    conditionsService: 'https://www.autohall.ma/fr/page/conditions-de-service',
    parametresCookies: 'https://www.autohall.ma/fr/page/parametres-des-cookies',
  },
  copyrightText: '© {year} Auto Hall. Tous droits réservés.',
  bgColor: '#002C6C',

  groupTitle: 'Groupe Auto Hall',
  groupLink1Label: 'À propos de nous',
  groupLink1Url: 'https://www.autohall.ma/fr/page/a-propos-de-nous',
  groupLink2Label: 'Actualités',
  groupLink2Url: 'https://www.autohall.ma/fr/actualites',
  groupLink3Label: 'Réseau',
  groupLink3Url: 'https://www.autohall.ma/fr/reseau',

  servicesTitle: 'Nos Services',
  servicesLink1Label: 'Vente de véhicules',
  servicesLink1Url: 'https://www.autohall.ma/fr/reseau',
  servicesLink2Label: 'Service Après-Vente',
  servicesLink2Url: 'https://www.autohall.ma/fr/services/apres-vente',
  servicesLink3Label: 'Pièces de rechange',
  servicesLink3Url: 'https://www.autohall.ma/fr/services/pieces-de-rechange',

  careersTitle: 'Carrières',
  careersLink1Label: 'Offres d’emploi',
  careersLink1Url: 'https://www.autohall.ma/fr/carrieres',
  careersLink2Label: 'Candidature spontanée',
  careersLink2Url: 'https://www.autohall.ma/fr/carrieres/candidature-spontanee',
  careersLink3Label: 'Pourquoi nous rejoindre',
  careersLink3Url: 'https://www.autohall.ma/fr/carrieres/pourquoi-nous-rejoindre',

  showBrandsColumn: true,
  showCareersColumn: true,
};

export type VehicleModelItem = {
  id: string;
  name: string;
  image: string;
  price: string;
  badge: string;
  link: string;
};

export type ModelsGridBlockProps = {
  blockType: 'models-grid';
  title: string;
  subtitle: string;
  models: VehicleModelItem[];
};

export type CGTField = {
  id: 'modele' | 'ville' | 'date' | 'nom' | 'tel' | 'email';
  label: string;
  placeholder?: string;
  required: boolean;
  active: boolean;
};

export type CampaignGammeThermiqueBlockProps = {
  blockType: 'campaign-gamme-thermique';
  // Image
  bannerImage: string;
  bannerAlt?: string;
  // Layout
  layoutRatio?: '7/5' | '6/6';
  formPosition?: 'right' | 'left';
  imageSizing?: 'contain' | 'cover';
  layoutBackground?: string;
  // Form card style
  formBg?: string;
  formBgColor?: string;
  formShadow?: boolean;
  // Input style
  inputBorderColor?: string;
  // Form data
  modelsList: string[];
  villesList: string[];
  step1Title?: string;
  step2Title?: string;
  step3Title?: string;
  btnNextLabel?: string;
  btnBackLabel?: string;
  btnSubmitLabel?: string;
  colorPrimary?: string;
  studioPreviewStep?: 1 | 2 | 3;
  syncToAutoHallBase?: boolean;
  autoHallApiUrl?: string;
  borderRadius?: 'none' | 'md' | 'lg';
  formBgOpacity?: number;
  bgOpacity?: number;
  customizeVehicles?: boolean;
  fields?: CGTField[];
};

export type HeroImmersiveFormProps = {
  blockType: 'hero-immersive-form';
  bgImage: string | null;
  title: string;
  step1Title?: string;
  step1Subtitle?: string;
  step2Title?: string;
  step2Subtitle?: string;
  step3Title?: string;
  step3Subtitle?: string;
  btnNextLabel?: string;
  btnBackLabel?: string;
  btnSubmitLabel?: string;
  studioPreviewStep: 1 | 2 | 3;
  brandKey?: string | null;
  brandLogoUrl?: string | null;
  villesList: string[];
  modelsList: string[];
  colorPrimary: string;
  colorSecondary: string;
  colorBgSection: string;
  syncToAutoHallBase?: boolean;
  autoHallApiUrl?: string;
  overlayOpacity?: number;
  bgBlur?: 'none' | '2px' | '4px';
  cardPosition?: 'left' | 'right';
};

export type AlternatingShowcaseItem = {
  id: string;
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  linkLabel: string;
  feature1Icon: string;
  feature1Title: string;
  feature1Desc: string;
  feature2Icon: string;
  feature2Title: string;
  feature2Desc: string;
};

export type AlternatingShowcaseBlockProps = {
  blockType: 'alternating-showcase';
  items: AlternatingShowcaseItem[];
};

// ── Tactical Flash Campaign ────────────────────────────────────────────────────
/**
 * Bloc standalone autonome pour les campagnes flash promo (type fordpromo.myautohall.ma).
 * Structure : grille 12 colonnes — visuel (8 cols, dropzone si vide) + formulaire compact (4 cols).
 * Ce bloc est entièrement autonome : aucun navbar ou footer global ne lui est rattaché.
 */
export type TacticalFlashCampaignBlockProps = {
  blockType: 'tactical-flash-campaign';
  /** Couleur primaire de la marque (héritée dynamiquement du contexte global). */
  colorPrimary: string;
  colorSecondary: string;
  colorBgSection: string;
  /** URL du visuel promotionnel chargé via upload (null = dropzone UI). */
  promoImageUrl: string | null;
  promoImageAlt: string;
  /** Titre du formulaire compact affiché en majuscules. */
  formTitle: string;
  /** Texte du bouton de soumission. */
  btnSubmitLabel: string;
  /** Listes de villes. */
  villesList: string[];
  /** Logo optionnel de la marque affiché en haut du bloc. */
  brandLogoUrl: string | null;
  /** Clé de marque pour héritage dynamique des couleurs. */
  brandKey: string | null;
  /** Arrondi des boutons. */
  borderRadius: number;
  /** Couleur de fond du panneau formulaire. */
  formBgColor: string;
  /** URL du formulaire de soumission distant (POST). */
  formActionUrl: string;
  /** Badge marketing optionnel affiché au-dessus du titre (ex: "OFFRE EXCLUSIVE SAV"). */
  badgeText?: string;
  /** Titre marketing (headline) affiché à gauche du visuel. */
  headline?: string;
  /** Paragraphe descriptif affiché sous le headline. */
  description?: string;
  /** Libellé au-dessus du prix (ex: "À partir de"). */
  priceLabel?: string;
  /** Valeur du prix affichée en grand (ex: "199"). */
  priceValue?: string;
  /** Suffixe du prix (ex: "DH*"). */
  priceSuffix?: string;
  /** Arrondi des angles du visuel de campagne. */
  imageRadius?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  /** Ajustement du visuel dans son cadre. */
  imageFit?: 'cover' | 'contain';
  /** Hauteur maximale du visuel (colonne marketing), en pixels. */
  imageMaxHeight?: number;
  /** Masquer les textes marketing pour un mode visuel pur */
  hideMarketingText?: boolean;
  /** Espacement vertical de la section */
  sectionPadding?: 'compact' | 'balanced' | 'generous' | number;
  /** Couleur d'accentuation pour les champs du formulaire (focus, checkbox, CTA) */
  colorAccent?: string;
  /** Padding global controlling container gaps and vertical space */
  globalPadding?: number;
  /** Hauteur maximale du visuel de campagne (alias pour imageMaxHeight) */
  maxVisualHeight?: number;
  /** Mode d'ajustement visuel (alias pour imageFit) */
  visualFitMode?: 'cover' | 'contain';
};

// ── Multi-Step Test Drive ──────────────────────────────────────────────────────
export type MultiStepTestDriveBlockProps = {
  blockType: 'multi-step-test-drive';
  colorPrimary: string;
  colorSecondary: string;
  colorBgSection: string;
  promoImageUrl: string | null;
  imageSrc?: string | null;
  imageFit?: 'cover' | 'contain' | 'fill';
  imagePosition?: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'above-title' | 'below-title';
  imageFilter?: 'none' | 'blur' | 'grayscale';
  imageAspect?: string;
  imageSettings?: {
    fit: 'cover' | 'contain' | 'fill';
    position: 'center' | 'top' | 'bottom';
    effects: 'none' | 'blur' | 'grayscale';
    aspectRatio?: string;
  };
  promoImageAlt: string;
  brandLogoUrl: string | null;
  brandKey: string | null;
  borderRadius: number;
  formBgColor: string;
  formActionUrl: string;
  badgeText?: string;
  headline?: string;
  description?: string;
  imageRadius?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  imageMaxHeight?: number;
  imageAspectRatio?: 'video' | 'classic' | 'square' | 'wide' | 'auto';
  layoutType?: 'side-by-side' | 'stacked' | 'image-left' | 'image-right';
  hideMarketingText?: boolean;
  sectionPadding?: 'compact' | 'balanced' | 'generous' | number;
  colorAccent?: string;
  globalPadding?: number;
  maxVisualHeight?: number;
  visualFitMode?: 'cover' | 'contain';
  villesList: string[];
  modelesList: string[];
  formTitle: string;
  formSubtitle?: string;
  btnSubmitLabel: string;
  blockPadding?: 'normal' | 'large';
  elementRounded?: 'none' | 'md' | 'xl' | '2xl' | 'moyen' | 'grand' | 'aucun' | 'medium';
  layoutMode?: 'official' | 'split' | 'full';
};

export type ProBlockProps =
  | BrandNavbarBlockProps
  | SpecsGridBlockProps
  | ModelShowcaseGalleryBlockProps
  | ConversionFormSplitBlockProps
  | HeroShowroomProps
  | HeroMosaicProps
  | HeroCinematicProps
  | HeroImmersiveFormProps
  | CarouselBlockProps
  | SpecsShowroomBlockProps
  | ContactSectionBlockProps
  | ModelsGridBlockProps
  | CampaignGammeThermiqueBlockProps
  | FooterBlockProps
  | AlternatingShowcaseBlockProps
  | TacticalFlashCampaignBlockProps
  | MultiStepTestDriveBlockProps;


// ── Default props ───────────────────────────────────────────────────────────

export const DEFAULT_BRAND_NAVBAR: BrandNavbarBlockProps = {
  blockType: 'brand-navbar',
  brand: 'Auto Hall',
  logoUrl: '/assets/frontend/images/logo-autohall-header.svg',
  logoSrc: '/assets/frontend/images/logo-autohall-header.svg',
  altText: 'Auto Hall — Vente de voitures neuves',
  navLinks: [
    { id: 'link_1', label: 'Groupe', href: '/fr/groupe' },
    { id: 'link_2', label: 'Marques', href: '/fr/vehicules-neufs' },
    { id: 'link_3', label: 'Réseau', href: '/fr/reseau' },
    { id: 'link_4', label: 'Services', href: '/fr/page/service-apres-vente' },
    { id: 'link_5', label: 'Autocaz', href: '/fr/vehicules-d-occasion' },
    { id: 'link_6', label: 'Investisseurs', href: '/fr/investisseur' },
  ],
  sticky: true,
  phoneNumber: '0 800 09 28 28',
  contactHref: '/fr/contact',
  contactLabel: 'Contact',
  contactBgColor: '#002C6C',
  contactTextColor: '#ffffff',
  links: [
    { id: 'link_1', label: 'Groupe', href: '/fr/groupe' },
    { id: 'link_2', label: 'Marques', href: '/fr/vehicules-neufs' },
    { id: 'link_3', label: 'Réseau', href: '/fr/reseau' },
    { id: 'link_4', label: 'Services', href: '/fr/page/service-apres-vente' },
    { id: 'link_5', label: 'Autocaz', href: '/fr/vehicules-d-occasion' },
    { id: 'link_6', label: 'Investisseurs', href: '/fr/investisseur' },
  ],
  showLinks: true,
};

// No old hero showroom defaults

export const DEFAULT_SPECS_GRID: SpecsGridBlockProps = {
  blockType: 'specs-grid',
  title: 'Fiche Caractéristiques',
  columns: 3,
  specs: [
    { label: 'Motorisation', value: '1.5L EcoBoost', icon: 'Zap', hidden: false },
    { label: 'Boîte de vitesse', value: 'Automatique 7 rapports', icon: 'Cpu', hidden: false },
    { label: 'Puissance fiscale', value: '9 CV', icon: 'Star', hidden: false },
    { label: 'Volume du coffre', value: '448 L', icon: 'Award', hidden: false },
    { label: 'Garantie', value: '5 ans / 100 000 km', icon: 'Shield', hidden: false },
    { label: 'Connectivité', value: 'Écran tactile 12.3"', icon: 'Check', hidden: false },
  ],
};

export const DEFAULT_MODEL_SHOWCASE_GALLERY: ModelShowcaseGalleryBlockProps = {
  blockType: 'model-showcase-gallery',
  buttonText: 'Afficher toutes les photos',
  mainImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
  mainImageAlt: 'Vue principale du véhicule',
  thumbImage1: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  thumbImage1Alt: 'Détail du véhicule 1',
  thumbImage2: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  thumbImage2Alt: 'Détail du véhicule 2',
  thumbImage3: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  thumbImage3Alt: 'Détail du véhicule 3',
  thumbImage4: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=80',
  thumbImage4Alt: 'Détail du véhicule 4',
  borderRadius: 'md',
  gap: 'standard',
};

export const DEFAULT_CONVERSION_FORM: ConversionFormSplitBlockProps = {
  blockType: 'conversion-form-split',
  benefitsTitle: 'Vos avantages exclusifs',
  benefits: [
    { id: 'b1', text: 'Garantie constructeur de 5 ans ou 100 000 km', enabled: true },
    { id: 'b2', text: 'Financement personnalisé à taux préférentiel', enabled: true },
    { id: 'b3', text: 'Assistance routière Auto Hall 24h/7j', enabled: true },
  ],
  guaranteeText: 'Vos données personnelles sont sécurisées par Auto Hall.',
  showModel: true,
  showCity: true,
  showDate: true,
  showName: true,
  showPhone: true,
  gdprConsent: "En soumettant ce formulaire, j'accepte que les informations saisies soient exploitées par Auto Hall pour me recontacter concernant ma demande d'information.",
  ctaLabel: 'Valider ma demande',
  accentColor: '#288fe3',
};

export const DEFAULT_HERO_IMMERSIVE_FORM: HeroImmersiveFormProps = {
  blockType: 'hero-immersive-form',
  bgImage: '',
  title: 'Découvrez une nouvelle dimension de conduite.',
  step1Title: 'Commençons par confirmer votre disponibilité',
  step1Subtitle: 'Sélectionnez votre modèle et votre succursale',
  step2Title: 'Enfin, Fournir votre nom et téléphone',
  step2Subtitle: 'Entrez vos coordonnées pour finaliser la demande',
  step3Title: 'Demande Enregistrée !',
  step3Subtitle: 'Notre équipe Auto Hall prendra contact avec vous dans les plus brefs délais.',
  btnNextLabel: 'Suivant',
  btnBackLabel: 'Retour',
  btnSubmitLabel: 'Valider',
  studioPreviewStep: 1,
  brandKey: null,
  brandLogoUrl: null,
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  modelsList: ['[Modèle 1]', '[Modèle 2]', '[Modèle 3]'],
  colorPrimary: '#002C6C',
  colorSecondary: '#1b7ac8',
  colorBgSection: '#ffffff',
  syncToAutoHallBase: false,
  autoHallApiUrl: '/api/leads',
  overlayOpacity: 50,
  bgBlur: 'none',
  cardPosition: 'right',
};

export const DEFAULT_HERO_SHOWROOM: HeroShowroomProps = {
  blockType: 'hero-showroom',
  badgeText: 'ESSAI ROUTIER',
  title: '[Marque] [Modèle] — [Slogan]',
  description: 'Décrivez ici l’expérience de conduite, le confort et les technologies embarquées du modèle mis en avant.',
  priceAppel: '[Prix] DH*',
  autoHallApiUrl: '/api/public/leads',
  syncToAutoHallBase: false,
  modelsList: ['[Modèle] Finition 1', '[Modèle] Finition 2'],
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  brandKey: null,
  brandLogoUrl: null,
  formMode: 'multi-step',
  singleStepTitle: 'Demande de rappel rapide',
  studioPreviewStep: 1,
  vehicleImage: null,
  mediaType: 'image',
  layoutReversed: false,
  paddingTop: 96,
  paddingBottom: 96,
  colorPrimary: '#002C6C',
  colorSecondary: '#1b7ac8',
  colorText: '#0f172a',
  colorBgSection: '#ffffff',
  borderRadiusButtons: 32, // pill shape
  bgOverlayOpacity: 0,
  step1Title: 'Sélectionnez le véhicule',
  step2Title: 'Choisissez votre ville & date d\'essai',
  step3Title: 'Laissez-nous vos coordonnées de contact',
  btnNextLabel: 'Suivant',
  btnBackLabel: 'Retour',
  btnSubmitLabel: 'Valider',
};

export const DEFAULT_HERO_MOSAIC: HeroMosaicProps = {
  blockType: 'hero-mosaic',
  badgeText: 'DESIGN D’EXCEPTION',
  title: '[Marque] [Modèle] — [Slogan]',
  description: 'Un véhicule qui redéfinit les standards technologiques et le confort. Mettez en avant chaque detail du design.',
  priceAppel: '[Prix] DH*',
  autoHallApiUrl: '/api/public/leads',
  syncToAutoHallBase: false,
  modelsList: ['[Modèle] Finition 1', '[Modèle] Finition 2'],
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  brandKey: null,
  brandLogoUrl: null,
  formMode: 'multi-step',
  singleStepTitle: 'Reserver mon essai',
  studioPreviewStep: 1,
  vehicleImage: null,
  detailImage1: null,
  detailImage2: null,
  detailImage3: null,
  mediaType: 'gallery',
  layoutReversed: false,
  mosaicFormLayout: 'side',
  paddingTop: 96,
  paddingBottom: 96,
  colorPrimary: '#8C1D40',
  colorSecondary: '#6b122e',
  colorText: '#ffffff',
  colorBgSection: '#090d16', // dark modern bg for mosaic
  borderRadiusButtons: 12,
  bgOverlayOpacity: 0,
  step1Title: 'Sélectionnez votre version',
  step2Title: 'Choisissez votre ville & date',
  step3Title: 'Validez vos coordonnées',
  btnNextLabel: 'Suivant',
  btnBackLabel: 'Retour',
  btnSubmitLabel: 'Confirmer',
};

export const DEFAULT_HERO_CINEMATIC: HeroCinematicProps = {
  blockType: 'hero-cinematic',
  badgeText: 'IMPACT MAXIMUM',
  title: '[Marque] [Modèle] — [Slogan]',
  description: 'Un impact visuel inégalé dès le premier regard. Mettez en scène le changement avec assurance et élégance.',
  priceAppel: 'À partir de [Prix] DH/mois*',
  autoHallApiUrl: '/api/public/leads',
  syncToAutoHallBase: false,
  modelsList: ['[Modèle] Gamme 1', '[Modèle] Gamme 2'],
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  brandKey: null,
  brandLogoUrl: null,
  formMode: 'multi-step',
  singleStepTitle: 'Demander une offre',
  studioPreviewStep: 1,
  vehicleImage: null,
  mediaType: 'image',
  layoutReversed: false,
  bgVideoUrl: '',
  cinematicMinHeight: '80vh',
  formCardStyle: 'glass',
  paddingTop: 96,
  paddingBottom: 96,
  colorPrimary: '#002C6C',
  colorSecondary: '#1b7ac8',
  colorText: '#ffffff',
  colorBgSection: '#000000',
  borderRadiusButtons: 8,
  bgOverlayOpacity: 60,
  step1Title: 'Sélectionnez le modèle',
  step2Title: 'Choisissez votre ville',
  step3Title: 'Entrez vos coordonnées',
  btnNextLabel: 'Suivant',
  btnBackLabel: 'Retour',
  btnSubmitLabel: 'Obtenir l’offre',
};

/**
 * Clause RGPD officielle Auto Hall — loi 09-08 marocaine.
 * À utiliser dans tous les formulaires de capture de leads produits par le Studio.
 */
export const AUTOHALL_RGPD_CLAUSE =
  "J'ai lu et j'accepte les conditions générales d'utilisations, notamment la mention relative à la protection des données personnelles. Conformément à la loi 09-08, vous disposez d'un droit d'accès, de rectification et d'opposition au traitement de vos données personnelles.";

/**
 * Preset for "Campagne Flash Promo" — asymmetric hero with direct contact form.
 * Image zone (col-span-8) + form card (col-span-4). Single-step capture.
 */
export const DEFAULT_FLASH_PROMO_HERO: HeroShowroomProps = {
  blockType: 'hero-showroom',
  badgeText: 'OFFRE FLASH',
  title: '[Titre de l\'Offre Flash]',
  description: '',
  priceAppel: '',
  autoHallApiUrl: '/api/public/leads',
  syncToAutoHallBase: false,
  modelsList: [],
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  brandKey: null,
  brandLogoUrl: null,
  formMode: 'single-step',
  singleStepTitle: 'Contactez-moi',
  studioPreviewStep: 1,
  vehicleImage: null,
  mediaType: 'image',
  // Force asymmetric layout: image=8 cols, form=4 cols via layoutReversed=false
  layoutReversed: false,
  paddingTop: 0,
  paddingBottom: 0,
  colorPrimary: '#002C6C',
  colorSecondary: '#1b7ac8',
  colorText: '#0f172a',
  colorBgSection: '#f0f4f8',
  borderRadiusButtons: 6,
  bgOverlayOpacity: 0,
  step1Title: 'Sélectionnez le véhicule',
  step2Title: 'Choisissez votre ville & date',
  step3Title: 'Vos coordonnées',
  btnNextLabel: 'Suivant',
  btnBackLabel: 'Retour',
  btnSubmitLabel: 'Envoyer',
};

/** Minimal footer — strictly legal mentions, no brand columns, no careers block. */
export const DEFAULT_FOOTER_MINIMAL: FooterBlockProps = {
  blockType: 'footer-block',
  watermarkText: 'Auto Hall',
  socialLinks: {},
  legalLinks: {
    mentionsLegales: 'https://www.autohall.ma/fr/page/mentions-legales',
    politiqueConfidentialite: 'https://www.autohall.ma/fr/page/politique-de-confidentialite',
  },
  copyrightText: '© {year} Auto Hall. Tous droits réservés.',
  bgColor: '#002C6C',
  showBrandsColumn: false,
  showCareersColumn: false,
};

export const DEFAULT_SPECS_SHOWROOM: SpecsShowroomBlockProps = {
  blockType: 'specs-showroom',
  title: '[Modèle]',
  logoUrl: null,
  description: 'Ce modèle hybride/thermique est idéal pour les conducteurs à la recherche de confort, de sobriété et de technologie. Silencieux, connecté et efficient, il combine les avantages de sa motorisation à une polyvalence remarquable. Que ce soit en ville ou sur la route, il rend chaque trajet plus agréable et plus fluide.',
  priceAppel: '[Prix de départ] DH*',
  ctaLabel: 'Me faire rappeler',
  showPriceCard: true,
  keyFeatures: [
    { text: 'Conduite sereine', iconPreset: 'ShipWheel' },
    { text: 'Grande polyvalence', iconPreset: 'Zap' },
    { text: 'Hybridation performante', iconPreset: 'Leaf' },
  ],
  finitions: [
    {
      name: '[Finition 1]',
      desc: "Avec son style affirmé et ses finitions sportives, cette version s'adresse à ceux qui recherchent un véhicule à la fois dynamique, technologique et responsable.",
      options: [
        { label: 'Style dynamique', iconPreset: 'Gauge' },
        { label: 'Technologie embarquée', iconPreset: 'Monitor' },
        { label: 'Hybride performant', iconPreset: 'Zap' },
        { label: 'Autonomie électrique généreuse', iconPreset: 'Calendar' },
      ],
      pdfUrl: '',
    },
    {
      name: '[Finition 2]',
      desc: "L'élégance alliée au confort absolu : profitez d'équipements de sécurité innovants et de finitions raffinées pour voyager en toute sérénité.",
      options: [
        { label: 'Sécurité active', iconPreset: 'Shield' },
        { label: 'Confort de conduite', iconPreset: 'Armchair' },
        { label: 'Technologie embarquée', iconPreset: 'Monitor' },
        { label: 'Moteur efficient', iconPreset: 'Zap' },
      ],
      pdfUrl: '',
    },
  ],
  legalMentions: [
    '*Photos non contractuelles',
    "*Sous réserve d'acceptation du dossier",
    '*Selon conditions en vigueur',
  ],
};

export const DEFAULT_CONTACT_SECTION: ContactSectionBlockProps = {
  blockType: 'contact-section',
  title: 'Nous Contacter',
  subtitle: 'Nous sommes là pour répondre à vos questions.',
  imageUrl: 'https://www.autohall.ma/assets/frontend/images/contact-modele.png',
  submitLabel: 'Soumettre',
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  accentColor: '#002C6C',
  bgColor: '#ffffff',
  fields: DEFAULT_CONTACT_FIELDS.map(f => ({ ...f })),
};

/**
 * Defaults entièrement neutres pour le bloc Tactical Flash Campaign.
 * Aucun texte prédéfini, aucune image codée en dur — la zone visuelle
 * s'affiche sous forme de dropzone jusqu'à ce que l'utilisateur uploade son visuel.
 */
export const DEFAULT_TACTICAL_FLASH_CAMPAIGN: TacticalFlashCampaignBlockProps = {
  blockType: 'tactical-flash-campaign',
  colorPrimary: '#0051a3',
  colorSecondary: '#1b7ac8',
  colorBgSection: '#f8fafc',
  promoImageUrl: null,             // null → dropzone visible
  promoImageAlt: '',
  formTitle: 'CONTACTEZ-MOI',
  btnSubmitLabel: 'Envoyer',
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  brandLogoUrl: null,
  brandKey: null,
  borderRadius: 16,                // 16px (rounded-2xl) default for form card & buttons
  formBgColor: '#011625',          // midnight navy by default
  formActionUrl: '/api/public/leads',
  imageRadius: '2xl',              // 16px default for visual image
  imageFit: 'cover',
  imageMaxHeight: 260,
  hideMarketingText: false,
  sectionPadding: 'balanced',
  colorAccent: '#1b7ac8',
};

export const DEFAULT_MULTI_STEP_TEST_DRIVE: MultiStepTestDriveBlockProps = {
  blockType: 'multi-step-test-drive',
  colorPrimary: '#0051a3',
  colorSecondary: '#1b7ac8',
  colorBgSection: '#f8fafc',
  promoImageUrl: null,
  imageSettings: {
    fit: 'cover',
    position: 'center',
    effects: 'none',
    aspectRatio: '16/9',
  },
  promoImageAlt: 'Essai sur route',
  formTitle: 'RÉSERVER UN ESSAI',
  formSubtitle: 'Complétez vos informations pour planifier votre essai.',
  btnSubmitLabel: 'Confirmer mon essai',
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  modelesList: ['Opel Corsa', 'Opel Mokka', 'Ford Focus', 'Ford Kuga', 'Chery Tiggo 7', 'Chery Tiggo 8 Pro'],
  brandLogoUrl: null,
  brandKey: null,
  borderRadius: 16,
  formBgColor: '#ffffff',
  formActionUrl: '/api/public/leads',
  imageRadius: '2xl',
  imageFit: 'cover',
  imageMaxHeight: 360,
  imageAspectRatio: 'video',
  layoutType: 'side-by-side',
  imagePosition: 'below-title',
  hideMarketingText: false,
  sectionPadding: 'balanced',
  colorAccent: '#1b7ac8',
  badgeText: 'TEST DRIVE',
  headline: 'Réservez votre essai routier dès aujourd’hui',
  description: 'Vivez l’expérience de conduite unique d’un véhicule neuf. Remplissez le formulaire en quelques étapes simples.',
  blockPadding: 'normal',
  elementRounded: 'none',
  layoutMode: 'official',
};

export const DEFAULT_MODELS_GRID: ModelsGridBlockProps = {
  blockType: 'models-grid',
  title: '[Modèles de la Marque]',
  subtitle: 'Retrouvez ici la gamme complète proposée par Auto Hall au Maroc.',
  models: [
    {
      id: 'm1',
      name: '[Modèle 1]',
      price: '[Prix de départ] DH',
      badge: '[Badge]',
      image: '',
      link: ''
    },
    {
      id: 'm2',
      name: '[Modèle 2]',
      price: '[Prix de départ] DH',
      badge: '[Badge]',
      image: '',
      link: ''
    },
    {
      id: 'm3',
      name: '[Modèle 3]',
      price: '[Prix de départ] DH',
      badge: '[Badge]',
      image: '',
      link: ''
    }
  ]
};


export const DEFAULT_CAROUSEL: CarouselBlockProps = {
  blockType: 'carousel',
  items: [
    {
      title: "Gamme SUV",
      category: "SUV",
      button: "Découvrir",
      src: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Nouvelle Citadine",
      category: "Citadine",
      button: "Découvrir",
      src: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Berline Premium",
      category: "Berline",
      button: "Découvrir",
      src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    },
  ],
};

export const DEFAULT_CAMPAIGN_GAMME_THERMIQUE: CampaignGammeThermiqueBlockProps = {
  blockType: 'campaign-gamme-thermique',
  bannerImage: CGT_DEFAULT_BANNER,
  bannerAlt: 'Chery Gamme Thermique \u2014 Auto Hall',
  layoutRatio: '7/5',
  formPosition: 'right',
  imageSizing: 'cover',
  formBg: '#ffffff',
  formBgColor: '#ffffff',
  formShadow: true,
  inputBorderColor: '#d1d5db',
  modelsList: [
    'CHERY TIGGO 4 CROSS HEV',
    'CHERY TIGGO 7 PRO PHEV',
    'CHERY TIGGO 8 PHEV',
    'CHERY TIGGO 3X',
    'CHERY ARRIZO 6',
  ],
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  step1Title: 'S\u00e9lectionnez le v\u00e9hicule que vous souhaitez essayer',
  step2Title: 'Confirmez votre disponibilit\u00e9',
  step3Title: 'Vos coordonn\u00e9es',
  btnNextLabel: 'Suivant',
  btnBackLabel: 'Retour',
  btnSubmitLabel: 'Soumettre',
  colorPrimary: '#288fe3',
  studioPreviewStep: 1,
  syncToAutoHallBase: false,
  autoHallApiUrl: '/api/public/leads',
  borderRadius: 'none',
  formBgOpacity: 95,
  bgOpacity: 95,
  customizeVehicles: false,
  fields: [
    { id: 'modele', label: 'Modèle', placeholder: '', required: true, active: true },
    { id: 'ville', label: 'Ville', placeholder: '', required: true, active: true },
    { id: 'date', label: 'Date préférée pour l’essai', placeholder: '', required: true, active: true },
    { id: 'nom', label: 'Nom', placeholder: 'Entrez votre nom', required: true, active: true },
    { id: 'tel', label: 'Téléphone', placeholder: 'Entrez votre Téléphone', required: true, active: true },
    { id: 'email', label: 'Email', placeholder: 'Entrez votre adresse email', required: true, active: false },
  ],
};

export type FordPromoField = {
  id: string;
  label: string;
  placeholder?: string;
  type: string;
  required: boolean;
  active: boolean;
};

export type FordPromoBlockProps = {
  blockType: 'ford-promo';
  campaignImage: string;
  altText: string;
  formTitle: string;
  submitLabel: string;
  formBackground: string;
  primaryColor: string;
  formTextColor: string;
  cgvUrl: string;
  logoUrl: string | null;
  campaignId: string;
  apiUrl: string;
  villesList: string[];
  borderRadius: string;
  paddingSize: string;
  opacityLevel: string;
  customizeForm: boolean;
  showLogo: boolean;
  fields: FordPromoField[];
  successTitle: string;
  successMessage: string;
};

export const DEFAULT_FORD_FIELDS: FordPromoField[] = [
  { id: 'nom', label: 'Nom *', placeholder: 'Nom *', type: 'text', required: true, active: true },
  { id: 'prenom', label: 'Prénom *', placeholder: 'Prénom *', type: 'text', required: true, active: true },
  { id: 'tel', label: 'Téléphone *', placeholder: 'ex : 06xxxxxxxx *', type: 'tel', required: true, active: true },
  { id: 'email', label: 'Email', placeholder: 'machine@gmail.com', type: 'email', required: false, active: true },
  { id: 'ville', label: 'Ville *', type: 'select', required: true, active: true }
];

export const DEFAULT_FORD_PROMO: FordPromoBlockProps = {
  blockType: 'ford-promo',
  campaignImage: 'https://fordpromo.myautohall.ma/images/fordvisuelnv.png',
  altText: 'Ford — Soyez aussi Flash que nos ventes',
  formTitle: 'Contactez-moi',
  submitLabel: 'Envoyer',
  formBackground: 'rgba(139, 169, 203, 0.85)',
  primaryColor: '#2c82e6',
  formTextColor: '#1a2840',
  cgvUrl: 'https://fr.ford.ma/',
  logoUrl: '',
  campaignId: 'ford-promo',
  apiUrl: '/api/public/leads',
  villesList: [...AUTOHALL_OFFICIAL_CITIES],
  borderRadius: 'md',
  paddingSize: 'normal',
  opacityLevel: 'semi-transparent',
  customizeForm: false,
  showLogo: true,
  fields: [...DEFAULT_FORD_FIELDS],
  successTitle: 'Demande reçue !',
  successMessage: 'Un conseiller commercial Ford examinera vos informations et vous contactera par téléphone dans les plus brefs délais pour donner suite à votre demande.',
};

export const DEFAULT_ALTERNATING_SHOWCASE: AlternatingShowcaseBlockProps = {
  blockType: 'alternating-showcase',
  items: [
    {
      id: '1',
      badge: 'DESIGN',
      title: 'Un style dynamique et affirmé',
      description: 'Des lignes sculptées et une silhouette athlétique qui ne passent pas inaperçues. Chaque détail a été pensé pour allier esthétique moderne et aérodynamisme optimal.',
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      linkUrl: '#form_test_drive',
      linkLabel: 'Explorer',
      feature1Icon: 'Shield',
      feature1Title: 'Structure renforcée',
      feature1Desc: 'Sécurité maximale en toutes circonstances.',
      feature2Icon: 'Zap',
      feature2Title: 'Motorisation efficiente',
      feature2Desc: 'Puissance maîtrisée et consommations réduites.',
    },
    {
      id: '2',
      badge: 'TECHNOLOGIE',
      title: 'Connectivité intuitive embarquée',
      description: 'Profitez d’un cockpit numérique de dernière génération avec grand écran tactile, commandes vocales avancées et compatibilité smartphone sans fil.',
      imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      linkUrl: '#form_test_drive',
      linkLabel: 'Explorer',
      feature1Icon: 'Cpu',
      feature1Title: 'Cockpit intelligent',
      feature1Desc: 'Toutes les commandes à portée de main.',
      feature2Icon: 'Navigation',
      feature2Title: 'Aides à la conduite',
      feature2Desc: 'Régulateur adaptatif et maintien dans la voie.',
    }
  ]
};


// ── Insertion helpers ────────────────────────────────────────────────────────

function insertSectionNode(
  document: BuilderDocument,
  props: ProBlockProps,
): { document: BuilderDocument; nodeId: string } {
  const root = document.nodes[document.rootId];
  if (!root) return { document, nodeId: '' };

  const section = createNode({
    kind: 'section',
    name: props.blockType,
    parentId: document.rootId,
    props,
    layout: { width: '100%' },
  });

  const nextNodes = {
    ...document.nodes,
    [section.id]: section,
    [document.rootId]: {
      ...root,
      children: [...root.children, section.id],
    },
  };

  return {
    document: { ...document, nodes: nextNodes, meta: { ...document.meta, templateId: 'page' } },
    nodeId: section.id,
  };
}

export function insertBrandNavbarBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_BRAND_NAVBAR);
}

export function insertHeroShowroomBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_HERO_SHOWROOM);
}

export function insertHeroMosaicBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_HERO_MOSAIC);
}

export function insertHeroCinematicBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_HERO_CINEMATIC);
}

export function insertSpecsGridBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_SPECS_GRID);
}

export function insertModelShowcaseGalleryBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_MODEL_SHOWCASE_GALLERY);
}

export function insertConversionFormSplitBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_CONVERSION_FORM);
}

export function insertCarouselBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_CAROUSEL);
}

export function insertSpecsShowroomBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_SPECS_SHOWROOM);
}

export function insertContactSectionBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_CONTACT_SECTION);
}

export function insertFooterBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_FOOTER_BLOCK);
}

export function insertModelsGridBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_MODELS_GRID);
}

export function insertAlternatingShowcaseBlock(doc: BuilderDocument) {
  return insertSectionNode(doc, DEFAULT_ALTERNATING_SHOWCASE);
}

// ── Type guards ──────────────────────────────────────────────────────────────

const PRO_BLOCK_TYPES = new Set([
  'brand-navbar',
  'specs-grid',
  'model-showcase-gallery',
  'conversion-form-split',
  'hero-showroom',
  'hero-mosaic',
  'hero-cinematic',
  'hero-immersive-form',
  'carousel',
  'specs-showroom',
  'contact-section',
  'models-grid',
  'campaign-gamme-thermique',
  'footer-block',
  'alternating-showcase',
  'tactical-flash-campaign',
  'multi-step-test-drive',
]);

export function isProBlock(node: BuilderNode): boolean {
  const bt = (node.props as { blockType?: string })?.blockType;
  return Boolean(bt && PRO_BLOCK_TYPES.has(bt));
}

export function getProBlockType(node: BuilderNode): string | undefined {
  return (node.props as { blockType?: string })?.blockType;
}

// ── Brand theme configurations ────────────────────────────────────────────────
export type BrandThemePreset = {
  brand: string;
  primaryColor: string;
  secondaryColor: string;
  buttonRadius: string;
  fontFamily: string;
  luxMode?: boolean;
};

export const BRAND_THEME_PRESETS: Record<string, BrandThemePreset> = {
  ford: {
    brand: 'Ford',
    primaryColor: '#002C6C',
    secondaryColor: '#1b7ac8',
    buttonRadius: '9999px',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  opel: {
    brand: 'Opel',
    primaryColor: '#E1F000',
    secondaryColor: '#101010',
    buttonRadius: '0px',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  chery: {
    brand: 'Chery',
    primaryColor: '#8C1D40',
    secondaryColor: '#6b122e',
    buttonRadius: '12px',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  maserati: {
    brand: 'Maserati',
    primaryColor: '#101010',
    secondaryColor: '#52525b',
    buttonRadius: '4px',
    fontFamily: "'Georgia', 'Playfair Display', serif",
    luxMode: true,
  },
  byd: {
    brand: 'BYD',
    primaryColor: '#00529b',
    secondaryColor: '#0072c6',
    buttonRadius: '8px',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  custom: {
    brand: 'Custom',
    primaryColor: '#288fe3',
    secondaryColor: '#1b7ac8',
    buttonRadius: '8px',
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
};

