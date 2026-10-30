import type { BuilderDocument } from '../types/nodes.types';
import { createNode } from './node-factory';
import { getAutoHallBrand } from '@/config/brands';
import {
  DEFAULT_BRAND_NAVBAR,
  DEFAULT_SPECS_GRID,
  DEFAULT_MODEL_SHOWCASE_GALLERY,
  DEFAULT_CONVERSION_FORM,
  DEFAULT_HERO_SHOWROOM,
  DEFAULT_HERO_MOSAIC,
  DEFAULT_HERO_CINEMATIC,
  DEFAULT_HERO_IMMERSIVE_FORM,
  DEFAULT_CAROUSEL,
  DEFAULT_SPECS_SHOWROOM,
  DEFAULT_CONTACT_SECTION,
  DEFAULT_MODELS_GRID,
  DEFAULT_CAMPAIGN_GAMME_THERMIQUE,
  DEFAULT_FOOTER_BLOCK,
  DEFAULT_ALTERNATING_SHOWCASE,
  DEFAULT_TACTICAL_FLASH_CAMPAIGN,
  DEFAULT_MULTI_STEP_TEST_DRIVE,
  AUTOHALL_OFFICIAL_CITIES,
} from './pro-blocks';
import { insertHeroFormBlock } from './studio-compat.js';
import { insertAutoHallSavStarterBlock, AUTOHALL_SAV_STARTER_BLOCK_ID } from './autohall-sav-starter-block';

export type BlockId = string;

// ── Prop-based section insertion ─────────────────────────────────────────────

function insertProBlockSection(
  document: BuilderDocument,
  blockName: string,
  blockLabel: string,
  props: Record<string, any>,
  insertAfterId?: string | null,
): { document: BuilderDocument; sectionId: string } {
  const rootId = document.rootId;
  const root = document.nodes[rootId];

  const section = createNode({
    kind: 'section',
    name: blockName,
    parentId: rootId,
    props: { ...props, label: blockLabel },
    layout: { width: '100%' },
  });

  let newChildren: string[];
  if (insertAfterId && root) {
    const idx = root.children.indexOf(insertAfterId);
    newChildren = idx !== -1
      ? [...root.children.slice(0, idx + 1), section.id, ...root.children.slice(idx + 1)]
      : [...(root?.children ?? []), section.id];
  } else {
    newChildren = [...(root?.children ?? []), section.id];
  }

  const nextNodes = {
    ...document.nodes,
    [section.id]: section,
    ...(root ? { [rootId]: { ...root, children: newChildren } } : {}),
  };

  const meta = document.meta.templateId === 'campaign-hero-form'
    ? { ...document.meta, templateId: 'page' as const }
    : document.meta;

  return { document: { ...document, nodes: nextNodes, meta }, sectionId: section.id };
}

export function resolveBlockId(blockId: string): BlockId {
  const legacyMap: Record<string, string> = {
    'brand-navbar': 'brand-navbar',
    'specs-grid': 'specs-grid',
    // 'Immersive Gallery' a été remplacé définitivement par 'Model Showcase Gallery' —
    // alias conservé pour que les documents existants continuent de résoudre le bloc.
    'immersive-gallery': 'model-showcase-gallery',
    'model-showcase-gallery': 'model-showcase-gallery',
    'conversion-form-split': 'conversion-form-split',
    'hero-form-unified': 'hero-showroom',
    'hero-split-classic': 'hero-showroom',
    'hero-immersive-overlay': 'hero-cinematic',
    'hero-art': 'hero-cinematic',
    'hero_art': 'hero-cinematic',
    'carousel': 'carousel',
    'specs-showroom': 'specs-showroom',
    'contact-section': 'contact-section',
    'ford-territory': 'ford-territory',
    'chery-template': 'chery-template',
    'tpl-campagne-universel': 'tpl-campagne-thermique',
    'tpl-campagne-thermique': 'tpl-campagne-thermique',
    'campaign-gamme-thermique': 'campaign-gamme-thermique',
    'ford-promo-template': 'ford-promo-template',
    'footer-block': 'footer-block',
    'ford-promo': 'hero-showroom',
    'fiche-modele-officielle': 'fiche-modele-officielle',
    'decouverte-gamme-energie': 'decouverte-gamme-energie',
    'tactical-flash-campaign': 'tactical-flash-campaign',
    'multi-step-test-drive': 'multi-step-test-drive',
    [AUTOHALL_SAV_STARTER_BLOCK_ID]: AUTOHALL_SAV_STARTER_BLOCK_ID,
  };
  return legacyMap[blockId] ?? blockId;
}

export function insertCanvasBlock(
  document: BuilderDocument,
  blockId: string,
  selectedNodeId?: string | null,
  insertAfterId?: string | null,
): { document: BuilderDocument; selectedId: string | null } {
  const resolved = resolveBlockId(blockId);
  const targetAfterId = insertAfterId || selectedNodeId;

  if (resolved === AUTOHALL_SAV_STARTER_BLOCK_ID) {
    const { document: result, nodeId } = insertAutoHallSavStarterBlock(document);
    return { document: result, selectedId: nodeId };
  }

  if (resolved === 'fiche-modele-officielle') {
    let currentDoc = document;
    let lastId: string | null = targetAfterId ?? null;

    // 1. Brand Navbar
    const navResult = insertProBlockSection(
      currentDoc, 'brand-navbar', 'Brand Navbar', DEFAULT_BRAND_NAVBAR, lastId
    );
    currentDoc = navResult.document;
    lastId = navResult.sectionId;

    // 2. Hero Immersive Form
    const heroResult = insertProBlockSection(
      currentDoc, 'hero-immersive-form', 'Hero Immersive Form', DEFAULT_HERO_IMMERSIVE_FORM, lastId
    );
    currentDoc = heroResult.document;
    lastId = heroResult.sectionId;

    // 3. Specs Showroom (Model Identity Showroom)
    const showroomResult = insertProBlockSection(
      currentDoc, 'specs-showroom', 'Model Identity Showroom', DEFAULT_SPECS_SHOWROOM, lastId
    );
    currentDoc = showroomResult.document;
    lastId = showroomResult.sectionId;

    // 4. Alternating Showcase
    const altResult = insertProBlockSection(
      currentDoc, 'alternating-showcase', 'Alternating Showcase', DEFAULT_ALTERNATING_SHOWCASE, lastId
    );
    currentDoc = altResult.document;
    lastId = altResult.sectionId;

    // 5. Model Showcase Gallery
    const galleryResult = insertProBlockSection(
      currentDoc, 'model-showcase-gallery', 'Model Showcase Gallery', DEFAULT_MODEL_SHOWCASE_GALLERY, lastId
    );
    currentDoc = galleryResult.document;
    lastId = galleryResult.sectionId;

    // 6. Footer
    const footerResult = insertProBlockSection(
      currentDoc, 'footer-block', 'Footer', DEFAULT_FOOTER_BLOCK, lastId
    );
    currentDoc = footerResult.document;
    lastId = footerResult.sectionId;

    return { document: currentDoc, selectedId: lastId };
  }

  if (resolved === 'decouverte-gamme-energie') {
    let currentDoc = document;
    let lastId: string | null = targetAfterId ?? null;

    // 1. Brand Navbar
    const navResult = insertProBlockSection(
      currentDoc, 'brand-navbar', 'Brand Navbar', DEFAULT_BRAND_NAVBAR, lastId
    );
    currentDoc = navResult.document;
    lastId = navResult.sectionId;

    // 2. Hero Mosaic Grid
    const heroResult = insertProBlockSection(
      currentDoc, 'hero-mosaic', 'Hero Mosaic Grid & Form', DEFAULT_HERO_MOSAIC, lastId
    );
    currentDoc = heroResult.document;
    lastId = heroResult.sectionId;

    // 3. Alternating Showcase
    const altResult = insertProBlockSection(
      currentDoc, 'alternating-showcase', 'Alternating Showcase', DEFAULT_ALTERNATING_SHOWCASE, lastId
    );
    currentDoc = altResult.document;
    lastId = altResult.sectionId;

    // 4. Footer
    const footerResult = insertProBlockSection(
      currentDoc, 'footer-block', 'Footer', DEFAULT_FOOTER_BLOCK, lastId
    );
    currentDoc = footerResult.document;
    lastId = footerResult.sectionId;

    return { document: currentDoc, selectedId: lastId };
  }

  // Note: the SAV starter is now a proper node-tree block, see
  // insertAutoHallSavStarterBlock() / autohall-sav-starter-block.ts above.


  if (resolved === 'chery-template') {
    let currentDoc = document;
    let lastId: string | null = targetAfterId ?? null;

    // 1. Navbar (Chery)
    const navResult = insertProBlockSection(
      currentDoc,
      'brand-navbar',
      'Navbar',
      {
        ...DEFAULT_BRAND_NAVBAR,
        brand: 'Chery',
        logoUrl: 'https://www.autohall.ma/uploads/marques/images/c4d1de718960e50a97a314a4177d732ae26d053b.svg',
        logoSrc: 'https://www.autohall.ma/uploads/marques/images/c4d1de718960e50a97a314a4177d732ae26d053b.svg',
        altText: 'Chery',
        navLinks: [
          { id: 'link_1', label: 'Accueil', href: '/' },
          { id: 'link_2', label: 'Modèles', href: '#models-grid' },
          { id: 'link_3', label: 'Contact & Essai', href: '#form_test_drive' },
        ],
        links: [
          { id: 'link_1', label: 'Accueil', href: '/' },
          { id: 'link_2', label: 'Modèles', href: '#models-grid' },
          { id: 'link_3', label: 'Contact & Essai', href: '#form_test_drive' },
        ],
      },
      lastId
    );
    currentDoc = navResult.document;
    lastId = navResult.sectionId;

    // 2. Hero Showroom (Chery)
    const formResult = insertProBlockSection(
      currentDoc,
      'hero-showroom',
      'Hero Showroom',
      {
        ...DEFAULT_HERO_SHOWROOM,
        title: 'Gamme CHERY - L\'excellence au meilleur prix',
        description: 'Profitez d\'offres exclusives et d\'un essai routier personnalisé.',
        priceAppel: '159 000 DH*',
        badgeText: 'ESSAI ROUTIER',
        vehicleImage: 'https://www.autohall.ma/sites/default/files/styles/brand_landing_hero/public/chery-brand-banner.jpg',
        bgOverlayOpacity: 30,
        colorPrimary: '#8C1D40',
        borderRadiusButtons: 12,
        villesList: [...AUTOHALL_OFFICIAL_CITIES],
        modelsList: ['Chery Tiggo 4 Cross HEV', 'Chery Tiggo 7 Pro PHEV', 'Chery Tiggo 8 PHEV', 'Chery Tiggo 3X'],
        step1Title: 'Sélectionnez le véhicule',
        step2Title: 'Disponibilité',
        step3Title: 'Coordonnées',
        btnNextLabel: 'Suivant',
        btnBackLabel: 'Retour',
        btnSubmitLabel: 'Valider',
        formMode: 'multi-step',
      },
      lastId
    );
    currentDoc = formResult.document;
    lastId = formResult.sectionId;

    // 3. Models Grid
    const modelsResult = insertProBlockSection(
      currentDoc,
      'models-grid',
      'Gamme Chery Auto Hall',
      {
        ...DEFAULT_MODELS_GRID,
        title: 'Gamme Chery Auto Hall',
        subtitle: 'Découvrez notre sélection de véhicules Chery et hybrides',
      },
      lastId
    );
    currentDoc = modelsResult.document;
    lastId = modelsResult.sectionId;

    // 4. Contact Section
    const contactResult = insertProBlockSection(
      currentDoc,
      'contact-section',
      'Nous Contacter',
      {
        ...DEFAULT_CONTACT_SECTION,
        accentColor: '#002c6c',
      },
      lastId
    );
    currentDoc = contactResult.document;
    lastId = contactResult.sectionId;

    // 5. Footer
    const footerResult = insertProBlockSection(
      currentDoc, 'footer-block', 'Footer', DEFAULT_FOOTER_BLOCK, lastId
    );
    currentDoc = footerResult.document;
    lastId = footerResult.sectionId;

    return { document: currentDoc, selectedId: lastId };
  }

  if (resolved === 'ford-territory') {
    let currentDoc = document;
    let lastId: string | null = targetAfterId ?? null;

    // 1. Navbar (Ford)
    const navResult = insertProBlockSection(
      currentDoc,
      'brand-navbar',
      'Navbar',
      {
        ...DEFAULT_BRAND_NAVBAR,
        brand: 'Ford',
        logoUrl: 'https://www.autohall.ma/assets/brands/ford.png',
        altText: 'Ford',
      },
      lastId
    );
    currentDoc = navResult.document;
    lastId = navResult.sectionId;

    // 2. Model Showcase Gallery (Ford Territory images)
    const galleryResult = insertProBlockSection(
      currentDoc,
      'model-showcase-gallery',
      'Galerie du Modèle',
      {
        blockType: 'model-showcase-gallery',
        buttonText: 'Afficher toutes les photos',
        mainImage: 'https://www.autohall.ma/uploads/medias/901c3ac73d6a19a48168dca3b5d2e76e38d23267.jpg',
        mainImageAlt: 'Ford Territory Maroc SUV',
        thumbImage1: 'https://www.autohall.ma/uploads/medias/ac5e4ae6f22ffc86e2497b5fdb0813fefcaf2e39.jpg',
        thumbImage1Alt: 'Jante Ford Territory',
        thumbImage2: 'https://www.autohall.ma/uploads/medias/3740d647da5eddb0d4f4f8a2ff55a406e589f98e.jpg',
        thumbImage2Alt: 'Intérieur Sièges',
        thumbImage3: 'https://www.autohall.ma/uploads/medias/6c89f4691f16c3ff7aef475a2e155f77413b1406.jpg',
        thumbImage3Alt: 'Tableau de bord Ford Territory',
        thumbImage4: 'https://www.autohall.ma/uploads/medias/6d2702e5f66a4bfa44c4b1e3648f290f6bc5c1ac.jpg',
        thumbImage4Alt: 'Design Ford Territory',
      },
      lastId
    );
    currentDoc = galleryResult.document;
    lastId = galleryResult.sectionId;

    // 3. Specs Showroom (Titanium / Titanium X finitions)
    const specsResult = insertProBlockSection(
      currentDoc,
      'specs-showroom',
      'Caractéristiques',
      DEFAULT_SPECS_SHOWROOM,
      lastId
    );
    currentDoc = specsResult.document;
    lastId = specsResult.sectionId;

    // 4. Hero Showroom (Ford Territory)
    const formResult = insertProBlockSection(
      currentDoc,
      'hero-showroom',
      'Formulaire d\'Essai Routier',
      {
        ...DEFAULT_HERO_SHOWROOM,
        title: 'Ford Territory : le SUV hybride qui conjugue confort, sobriété et modernité',
        description: 'Veuillez indiquer vos disponibilités pour l\'essai.',
        priceAppel: '370 000 DH*',
        badgeText: 'ESSAI ROUTIER',
        vehicleImage: 'https://www.autohall.ma/sites/default/files/styles/model_landing_hero/public/ford-territory.jpg',
        bgOverlayOpacity: 65,
        colorPrimary: '#002C6C',
        borderRadiusButtons: 32, // round style for Ford
        villesList: [...AUTOHALL_OFFICIAL_CITIES],
        modelsList: ['Ford Territory Titanium', 'Ford Territory Titanium X'],
        formMode: 'multi-step',
      },
      lastId
    );
    currentDoc = formResult.document;
    lastId = formResult.sectionId;

    // 5. Contact Section
    const contactResult = insertProBlockSection(
      currentDoc,
      'contact-section',
      'Nous Contacter',
      DEFAULT_CONTACT_SECTION,
      lastId
    );
    currentDoc = contactResult.document;
    lastId = contactResult.sectionId;

    // 6. Footer
    const footerResult = insertProBlockSection(
      currentDoc, 'footer-block', 'Footer', DEFAULT_FOOTER_BLOCK, lastId
    );
    currentDoc = footerResult.document;
    lastId = footerResult.sectionId;

    return { document: currentDoc, selectedId: lastId };
  }

  if (resolved === 'ford-promo-template') {
    let currentDoc = document;
    let lastId: string | null = targetAfterId ?? null;

    // 1. Navbar (Ford)
    const navResult = insertProBlockSection(
      currentDoc,
      'brand-navbar',
      'Navbar',
      {
        ...DEFAULT_BRAND_NAVBAR,
        brand: 'Ford',
        logoUrl: 'https://www.autohall.ma/assets/brands/ford.png',
        logoSrc: 'https://www.autohall.ma/assets/brands/ford.png',
        altText: 'Ford',
      },
      lastId
    );
    currentDoc = navResult.document;
    lastId = navResult.sectionId;

    // 2. Hero Showroom (Ford Promo)
    const promoResult = insertProBlockSection(
      currentDoc,
      'hero-showroom',
      'Campagne Ford Showroom',
      {
        ...DEFAULT_HERO_SHOWROOM,
        title: 'Soyez aussi Flash que nos ventes',
        description: 'Bénéficiez de remises exceptionnelles et d\'offres de financement sur toute la gamme Ford.',
        badgeText: 'OFFRES FLASH',
        vehicleImage: 'https://fordpromo.myautohall.ma/images/fordvisuelnv.png',
        bgOverlayOpacity: 0, // original was white / transparent background layout
        colorPrimary: '#2c82e6',
        borderRadiusButtons: 8,
        villesList: [...AUTOHALL_OFFICIAL_CITIES],
        formMode: 'single-step',
        singleStepTitle: 'Contactez-moi',
        btnSubmitLabel: 'Envoyer',
      },
      lastId
    );
    currentDoc = promoResult.document;
    lastId = promoResult.sectionId;

    return { document: currentDoc, selectedId: lastId };
  }

  if (resolved === 'tpl-campagne-thermique' || resolved === 'campagne-thermique-template' || resolved === 'tpl-flagship-lead') {
    // Insert Navbar + Gamme Thermique block
    let currentDoc = document;
    let lastId: string | null = targetAfterId ?? null;

    // 1. Brand Navbar (Auto Hall default)
    const navResult = insertProBlockSection(
      currentDoc,
      'brand-navbar',
      'Navbar',
      {
        ...DEFAULT_BRAND_NAVBAR,
        navLinks: [
          { id: 'link_1', label: 'Accueil', href: '/' },
          { id: 'link_2', label: 'Nos Véhicules', href: '/fr/vehicules-neufs' },
          { id: 'link_3', label: 'Réseau', href: '/fr/reseau' },
          { id: 'link_4', label: 'Contact', href: '#contact-section' },
        ],
        links: [
          { id: 'link_1', label: 'Accueil', href: '/' },
          { id: 'link_2', label: 'Nos Véhicules', href: '/fr/vehicules-neufs' },
          { id: 'link_3', label: 'Réseau', href: '/fr/reseau' },
          { id: 'link_4', label: 'Contact', href: '#contact-section' },
        ],
      },
      lastId
    );
    currentDoc = navResult.document;
    lastId = navResult.sectionId;

    // 2. Campaign Gamme Thermique block: banner image left + 3-step form card right
    const cgtResult = insertProBlockSection(
      currentDoc,
      'campaign-gamme-thermique',
      'Campagne Gamme Thermique',
      DEFAULT_CAMPAIGN_GAMME_THERMIQUE,
      lastId
    );
    currentDoc = cgtResult.document;
    lastId = cgtResult.sectionId;

    return { document: currentDoc, selectedId: lastId };
  }

  if (resolved === 'campaign-gamme-thermique') {
    const { document: result, sectionId } = insertProBlockSection(
      document,
      'campaign-gamme-thermique',
      'Campagne Gamme Thermique',
      DEFAULT_CAMPAIGN_GAMME_THERMIQUE,
      targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'brand-navbar') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'brand-navbar', 'Navbar', DEFAULT_BRAND_NAVBAR, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'hero-showroom') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'Hero Showroom', 'Hero Showroom', DEFAULT_HERO_SHOWROOM, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'hero-mosaic') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'hero-mosaic', 'Hero Mosaic Grid', DEFAULT_HERO_MOSAIC, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'hero-cinematic') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'hero-cinematic', 'Hero Cinematic', DEFAULT_HERO_CINEMATIC, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'hero-immersive-form') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'hero-immersive-form', 'Hero Immersive Form', DEFAULT_HERO_IMMERSIVE_FORM, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'specs-grid') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'specs-grid', 'Specs Grid', DEFAULT_SPECS_GRID, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'model-showcase-gallery') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'model-showcase-gallery', 'Model Showcase Gallery', DEFAULT_MODEL_SHOWCASE_GALLERY, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'conversion-form-split') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'conversion-form-split', 'Conversion Form Split', DEFAULT_CONVERSION_FORM, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'carousel') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'carousel', 'Carousel', DEFAULT_CAROUSEL, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'specs-showroom') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'specs-showroom', 'Specs Showroom', DEFAULT_SPECS_SHOWROOM, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'contact-section') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'contact-section', 'Nous Contacter', DEFAULT_CONTACT_SECTION, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'footer-block') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'footer-block', 'Footer', DEFAULT_FOOTER_BLOCK, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'tactical-flash-campaign') {
    const brandId = document.meta?.selectedBrandId;
    const activeBrand = brandId ? getAutoHallBrand(brandId) : null;
    const primaryColor = activeBrand?.primaryColor || '#002C6C';
    const secondaryColor = activeBrand?.secondaryColor || '#1b7ac8';

    const { document: result, sectionId } = insertProBlockSection(
      document,
      'tactical-flash-campaign',
      'Tactical Flash Campaign',
      {
        ...DEFAULT_TACTICAL_FLASH_CAMPAIGN,
        brandKey: brandId || null,
        colorPrimary: primaryColor,
        colorSecondary: secondaryColor,
        formBgColor: primaryColor,
        brandLogoUrl: activeBrand?.logo || null,
        villesList: [...AUTOHALL_OFFICIAL_CITIES],
        promoImageUrl: null,
      },
      targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'alternating-showcase') {
    const { document: result, sectionId } = insertProBlockSection(
      document, 'alternating-showcase', 'Alternating Showcase', DEFAULT_ALTERNATING_SHOWCASE, targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'multi-step-test-drive') {
    const brandId = document.meta.selectedBrandId;
    const activeBrand = brandId ? getAutoHallBrand(brandId) : null;
    const primaryColor = activeBrand?.primaryColor || '#0051a3';
    const secondaryColor = activeBrand?.secondaryColor || '#1b7ac8';

    const { document: result, sectionId } = insertProBlockSection(
      document,
      'multi-step-test-drive',
      'Multi-Step Test Drive',
      {
        ...DEFAULT_MULTI_STEP_TEST_DRIVE,
        brandKey: brandId || null,
        colorPrimary: primaryColor,
        colorSecondary: secondaryColor,
        formBgColor: primaryColor,
        brandLogoUrl: activeBrand?.logo || null,
      },
      targetAfterId
    );
    return { document: result, selectedId: sectionId };
  }

  if (resolved === 'hero-form' || resolved === 'hero-form-preset') {
    const { document: result, nodeId } = insertHeroFormBlock(document);
    return { document: result, selectedId: nodeId };
  }

  return { document, selectedId: null };
}

export function insertHeroFormPreset(doc: BuilderDocument) {
  const res = insertCanvasBlock(doc, 'hero-form-preset');
  return { document: res.document, nodeId: res.selectedId || '' };
}
