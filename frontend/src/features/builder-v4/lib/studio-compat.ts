import type {
  BuilderDocument,
  BuilderNode,
  HeroFormGeometry,
} from '../types/nodes.types';
import { createNode, linkParentChild } from './node-factory';
import { findImageLayer, findFormLayer } from './hero-layers';
import { isUserHeroMediaAssigned } from '../media/hero-media-state';
import { buildJourneyFromAssistant } from './form-journey-assistant.js';
import { isStepWithoutFields } from './form-step-templates.js';
// Constants
export const CONTENT_LAYER_NAME = 'ContentLayer';
export const FORM_LAYER_NAME = 'FormLayer';
export const IMAGE_LAYER_NAME = 'ImageLayer';
export const HERO_CONTENT_NODE_NAMES = {
  badge: 'HeroBadge',
  title: 'HeroTitle',
  subtitle: 'HeroSubtitle',
  cta: 'HeroCta',
};
export const HERO_FORM_BLOCK_NAME = 'HeroFormSection';
export const HERO_FORM_SECTION_ALIASES = ['HeroFormSection', 'HeroBlock', 'Hero+Form', 'campaign-hero-form', 'hero-form', 'hero-form-unified', 'hero-split-classic', 'hero-immersive-overlay', 'hero-showroom', 'hero-mosaic', 'hero-cinematic', 'hero-immersive-form'];

export const DEFAULT_HERO_FORM_GEOMETRY: HeroFormGeometry = {
  mode: 'split',
  leftRatio: 72,
  rightRatio: 28,
  minHeight: 720,
};

export type HeroImageBehavior = 'campaign-poster' | 'background' | 'smart-crop';

export const HERO_IMAGE_BEHAVIOR_LABELS: Record<HeroImageBehavior, string> = {
  'campaign-poster': 'Affiche de campagne',
  background: 'Arrière-plan',
  'smart-crop': 'Recadrage intelligent',
};

export type HeroContentBlockKind = 'badge' | 'title' | 'subtitle' | 'description' | 'cta' | 'list';

// Helper functions

export function isHeroFormBlock(node: BuilderNode | undefined): boolean {
  if (!node) return false;
  return (
    node.name === HERO_FORM_BLOCK_NAME ||
    HERO_FORM_SECTION_ALIASES.includes(node.name) ||
    (node.kind === 'section' && ['hero-form', 'hero-form-unified', 'hero-split-classic', 'hero-immersive-overlay', 'hero-showroom', 'hero-mosaic', 'hero-cinematic', 'hero-immersive-form'].includes((node.props as any).blockType))
  );
}

export function findHeroFormBlock(document: BuilderDocument): BuilderNode | undefined {
  return Object.values(document.nodes).find(isHeroFormBlock);
}

export function findHeroFormLayers(document: BuilderDocument, heroId: string) {
  const { nodes } = document;
  const image = Object.values(nodes).find((n) => n.parentId === heroId && n.name === 'ImageLayer');
  const form = Object.values(nodes).find((n) => n.parentId === heroId && n.name === 'FormLayer');
  
  if (!image || !form) {
    // fallback
    const fallbackImage = findImageLayer(nodes, document.rootId);
    const fallbackForm = findFormLayer(nodes, document.rootId);
    if (fallbackImage && fallbackForm) {
      return { image: fallbackImage, form: fallbackForm };
    }
    return undefined;
  }
  return { image, form };
}

export function getHeroFormGeometry(document: BuilderDocument): HeroFormGeometry {
  const rootNode = document.nodes[document.rootId];
  if (!rootNode) return DEFAULT_HERO_FORM_GEOMETRY;
  const props = rootNode.props as any;
  return props?.heroFormGeometry ?? DEFAULT_HERO_FORM_GEOMETRY;
}

export function clampFormSafeWidthPx(width: number): number {
  if (width < 360) return 360;
  if (width > 440) return 440;
  return width;
}

export function computeSafeZones(geo: HeroFormGeometry) {
  return {
    mediaColumnFr: geo.leftRatio,
    formColumnFr: geo.rightRatio,
    formSafeWidthPx: 400,
  };
}

export function heroFormGridColumns(geo: HeroFormGeometry): string {
  return `${geo.leftRatio}fr ${geo.rightRatio}fr`;
}

export function resolveImageObjectFit(behavior: string): 'cover' | 'contain' | 'fill' {
  if (behavior === 'campaign-poster') return 'contain';
  return 'cover';
}

export function isSectionBlock(node: BuilderNode | undefined): boolean {
  return node?.kind === 'section';
}

export function getSectionBlockLabel(node: BuilderNode): string {
  const props = node.props as any;
  return props?.label ?? node.name ?? 'Section';
}

export function isPageEmpty(document: BuilderDocument): boolean {
  const root = document.nodes[document.rootId];
  return !root || root.children.length === 0;
}

export function getPageBlocks(document: BuilderDocument): BuilderNode[] {
  const root = document.nodes[document.rootId];
  if (!root) return [];
  return root.children.map((id) => document.nodes[id]).filter(Boolean);
}

export function createEmptyPageDocument(): BuilderDocument {
  const rootId = 'root';
  return {
    version: 4,
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        kind: 'frame',
        name: 'Page',
        children: [],
        parentId: null,
        props: { label: 'Page' },
        style: {},
        layout: {
          display: 'flex',
          direction: 'column',
          width: '100%',
          minHeight: '100vh',
        },
        responsive: {},
        visibility: { hidden: false, locked: false },
      },
    },
    meta: {
      title: 'Nouvelle Page',
      templateId: 'blank',
    },
  };
}

export function isEmptyPageDocument(document: BuilderDocument): boolean {
  return isPageEmpty(document);
}

export function isHeroContentElement(node: BuilderNode | undefined): boolean {
  if (!node) return false;
  return [
    'HeroContentGroup',
    'HeroBadge',
    'HeroTitle',
    'HeroSubtitle',
    'HeroDescription',
    'HeroCta',
    'HeroList',
    'HeroText',
  ].includes(node.name);
}

export function findHeroContentGroup(document: BuilderDocument) {
  const contentGroup = Object.values(document.nodes).find(
    (n) => n.name === 'ContentLayer' || n.name === 'HeroSafeArea' || n.name === 'HeroContentGroup'
  );
  if (!contentGroup) return undefined;
  return { contentGroup };
}

export function resolveHeroFormEditorState(
  document: BuilderDocument,
  getAsset: (id: string) => any
): 'empty' | 'building' | 'ready' {
  const { nodes, rootId } = document;

  const heroFormNode = Object.values(nodes).find(n => ['hero-form', 'hero-form-unified', 'hero-split-classic', 'hero-immersive-overlay', 'hero-showroom', 'hero-mosaic', 'hero-cinematic', 'hero-immersive-form'].includes((n.props as any)?.blockType) || n.name === 'HeroFormSection');
  if (heroFormNode) {
    const props = heroFormNode.props as any;
    const isFlat = !heroFormNode.children || heroFormNode.children.length === 0;
    if (isFlat) {
      const bg = props.bgImage ?? props.backgroundImage ?? props.vehicleImage;
      const hasImage = bg === null || (typeof bg === 'string' && bg.trim() !== '');
      if (!hasImage) return 'empty';

      const steps = props.steps || [];
      const hasEmptyStep = steps.some((step: any) => !step.fieldIds || step.fieldIds.length === 0);
      if (hasEmptyStep) return 'building';

      return 'ready';
    }
  }

  const imageLayer = findImageLayer(nodes, rootId);
  const formLayer = findFormLayer(nodes, rootId);

  if (!imageLayer || !formLayer) return 'empty';

  const imageProps = imageLayer.props as any;
  const assigned = isUserHeroMediaAssigned(imageProps, getAsset);
  if (!assigned) return 'empty';

  const formProps = formLayer.props as { steps?: Array<{ fieldIds?: string[]; kind?: string }> };
  const steps = formProps.steps || [];
  const hasEmptyStep = steps.some((step) => isStepWithoutFields(step as import('../types/nodes.types').FormStepConfig));
  if (hasEmptyStep) return 'building';

  return 'ready';
}

export type HeroFormProductState = 'empty' | 'building' | 'ready' | 'preview';

export function resolveHeroFormProductState(
  document: BuilderDocument,
  getAsset: (id: string) => unknown,
  previewMode: boolean,
): HeroFormProductState {
  if (previewMode) return 'preview';
  return resolveHeroFormEditorState(document, getAsset);
}

export const HERO_FORM_STATE_LABELS: Record<
  'empty' | 'building' | 'ready' | 'preview',
  string
> = {
  empty: 'Média requis',
  building: 'Formulaire requis',
  ready: 'Prêt',
  preview: 'Aperçu',
};

export function hasHeroContentBlock(document: BuilderDocument, kind: HeroContentBlockKind): boolean {
  const map: Record<HeroContentBlockKind, string> = {
    badge: 'HeroBadge',
    title: 'HeroTitle',
    subtitle: 'HeroSubtitle',
    description: 'HeroDescription',
    cta: 'HeroCta',
    list: 'HeroList',
  };
  const name = map[kind];
  return Object.values(document.nodes).some((node) => node.name === name);
}

export function insertHeroContentBlock(
  document: BuilderDocument,
  kind: HeroContentBlockKind
): { document: BuilderDocument; nodeId: string } | null {
  const { nodes } = document;
  const contentLayer = Object.values(nodes).find(
    (n) => n.name === 'ContentLayer' || n.name === 'HeroSafeArea' || n.name === 'HeroContentGroup'
  );
  if (!contentLayer) return null;

  let newNode: BuilderNode;

  if (kind === 'badge') {
    newNode = createNode({
      kind: 'text',
      name: 'HeroBadge',
      parentId: contentLayer.id,
      props: {
        text: 'Nouveau badge',
        tag: 'span',
        typographyToken: 'badge',
        editable: true,
      },
      style: {
        color: '#e85d04',
        fontSize: 14,
        fontWeight: 700,
      },
    });
  } else if (kind === 'title') {
    newNode = createNode({
      kind: 'text',
      name: 'HeroTitle',
      parentId: contentLayer.id,
      props: {
        text: 'Titre de la campagne',
        tag: 'h1',
        typographyToken: 'h1',
        editable: true,
      },
      style: {
        color: '#111827',
        fontSize: 34,
        fontWeight: 700,
      },
    });
  } else if (kind === 'subtitle') {
    newNode = createNode({
      kind: 'text',
      name: 'HeroSubtitle',
      parentId: contentLayer.id,
      props: {
        text: 'Sous-titre accrocheur',
        tag: 'p',
        typographyToken: 'body',
        editable: true,
      },
      style: {
        color: '#4b5563',
        fontSize: 18,
        fontWeight: 400,
      },
    });
  } else if (kind === 'description') {
    newNode = createNode({
      kind: 'text',
      name: 'HeroDescription',
      parentId: contentLayer.id,
      props: {
        text: "Description détaillée de l'offre et des avantages de la gamme.",
        tag: 'p',
        typographyToken: 'body',
        editable: true,
      },
      style: {
        color: '#4b5563',
        fontSize: 15,
        fontWeight: 400,
      },
    });
  } else if (kind === 'cta') {
    newNode = createNode({
      kind: 'button',
      name: 'HeroCta',
      parentId: contentLayer.id,
      props: {
        label: 'Découvrir',
        variant: 'primary',
      },
      style: {
        color: '#ffffff',
        background: '#e85d04',
        borderRadius: 6,
      },
    });
  } else if (kind === 'list') {
    newNode = createNode({
      kind: 'text',
      name: 'HeroList',
      parentId: contentLayer.id,
      props: {
        text: '• Point fort 1\n• Point fort 2',
        tag: 'p',
        typographyToken: 'body',
        editable: true,
      },
      style: {
        color: '#4b5563',
        fontSize: 15,
      },
    });
  } else {
    return null;
  }

  let nextNodes = { ...nodes, [newNode.id]: newNode };
  nextNodes = linkParentChild(nextNodes, contentLayer.id, newNode.id);

  return {
    document: {
      ...document,
      nodes: nextNodes,
    },
    nodeId: newNode.id,
  };
}

export function applyHeroFormLayout(
  document: BuilderDocument,
  heroId: string,
  geometry?: HeroFormGeometry
): BuilderDocument {
  const { nodes, rootId } = document;
  const frame = nodes[rootId];
  if (!frame) return document;

  const geo = geometry ?? (frame.props as any).heroFormGeometry ?? DEFAULT_HERO_FORM_GEOMETRY;
  const nextNodes = { ...nodes };

  nextNodes[rootId] = {
    ...frame,
    props: {
      ...frame.props,
      heroFormGeometry: geo,
    },
    layout: {
      ...frame.layout,
      display: 'flex',
      direction: 'column',
      columns: undefined,
    },
  };

  const heroNode = nextNodes[heroId];
  if (heroNode) {
    nextNodes[heroId] = {
      ...heroNode,
      layout: {
        ...heroNode.layout,
        display: 'grid',
        columns: `${geo.leftRatio}fr ${geo.rightRatio}fr`,
        minHeight: geo.minHeight || 720,
      },
    };

    const layers = findHeroFormLayers(document, heroId);
    if (layers) {
      const { image, form } = layers;
      nextNodes[image.id] = {
        ...nextNodes[image.id],
        layout: {
          ...nextNodes[image.id].layout,
          gridColumn: '1 / 2',
          position: 'relative',
        },
      };
      nextNodes[form.id] = {
        ...nextNodes[form.id],
        layout: {
          ...nextNodes[form.id].layout,
          gridColumn: '2 / 3',
          position: 'relative',
        },
      };
    }
  }

  return {
    ...document,
    nodes: nextNodes,
  };
}

export function insertHeroFormBlock(document: BuilderDocument): { document: BuilderDocument; nodeId: string } {
  const { nodes, rootId } = document;
  const frame = nodes[rootId];

  const geo = DEFAULT_HERO_FORM_GEOMETRY;

  const heroBlock = createNode({
    kind: 'section',
    name: 'HeroFormSection',
    parentId: rootId,
    layout: {
      display: 'grid',
      width: '100%',
      minHeight: geo.minHeight,
      columns: `${geo.leftRatio}fr ${geo.rightRatio}fr`,
      position: 'relative',
    },
    props: {
      label: 'Hero + Form',
      blockType: 'hero-form',
    },
  });

  const imageLayer = createNode({
    kind: 'image',
    name: 'ImageLayer',
    parentId: heroBlock.id,
    layout: {
      gridColumn: '1 / 2',
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '100%',
    },
    props: {
      src: '',
      alt: 'Hero',
      fit: 'cover',
      imageBehavior: 'campaign-poster',
      overlayEnabled: true,
      overlayColor: '#000000',
      overlayOpacity: 35,
      overlayDirection: 'to-right',
      overlayGradient: true,
    },
    style: {
      objectFit: 'contain',
    },
  });

  const journey = buildJourneyFromAssistant({
    vehicle: true,
    city: true,
    testDate: true,
    name: true,
    phone: true,
    email: false,
    consent: false,
  });
  const steps = [...journey.steps];
  const fields = [...journey.fields];

  const formLayer = createNode({
    kind: 'form',
    name: 'FormLayer',
    parentId: heroBlock.id,
    layout: {
      gridColumn: '2 / 3',
      position: 'relative',
    },
    props: {
      variant: 'campaign',
      title: 'Réservez votre essai',
      subtitle: 'Remplissez le formulaire pour être recontacté.',
      submitLabel: 'Suivant',
      consentLabel: "J'accepte d'être contacté par Auto Hall.",
      stepCount: steps.length,
      currentStepLabel: 'Étape 1/4',
      showConsent: true,
      fields,
      steps,
      cardRadius: 12,
      cardBackground: '#ffffff',
      cardShadow: true,
      cardSpacing: 24,
      accentColor: '#e85d04',
      textColor: '#111827',
      fieldBackground: '#ffffff',
      successMessage: 'Merci ! Notre équipe vous contactera dans les 24h.',
      thankYouPage: '',
      redirectUrl: '',
    },
  });

  let nextNodes = { ...nodes };

  nextNodes[rootId] = {
    ...frame,
    props: {
      ...frame.props,
      heroFormGeometry: geo,
    },
    layout: {
      ...frame.layout,
      display: 'flex',
      direction: 'column',
      columns: undefined,
    },
  };

  nextNodes[heroBlock.id] = heroBlock;
  nextNodes[imageLayer.id] = imageLayer;
  nextNodes[formLayer.id] = formLayer;

  nextNodes = linkParentChild(nextNodes, rootId, heroBlock.id);
  nextNodes = linkParentChild(nextNodes, heroBlock.id, imageLayer.id);
  nextNodes = linkParentChild(nextNodes, heroBlock.id, formLayer.id);

  return {
    document: {
      ...document,
      nodes: nextNodes,
      meta: { ...document.meta, templateId: 'campaign-hero-form' },
    },
    nodeId: heroBlock.id,
  };
}
