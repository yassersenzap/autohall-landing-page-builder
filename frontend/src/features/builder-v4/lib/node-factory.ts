import { createSafeRandomId } from '@/lib/create-safe-random-id';
import type {
  BuilderDocument,
  BuilderNode,
  ButtonNodeProps,
  CardNodeProps,
  FormNodeProps,
  FrameNodeProps,
  ImageNodeProps,
  InputNodeProps,
  NodeKind,
  NodeLayout,
  NodePropsByKind,
  NodeResponsive,
  NodeStyle,
  NodeVisibility,
  SectionNodeProps,
  StackNodeProps,
  TextNodeProps,
} from '../types/nodes.types';
import {
  emptyLayout,
  emptyResponsive,
  emptyStyle,
  emptyVisibility,
} from '../types/nodes.types';

export function createNodeId(prefix = 'node'): string {
  return `${prefix}-${createSafeRandomId()}`;
}

type CreateNodeInput<K extends NodeKind> = {
  kind: K;
  name: string;
  parentId?: string | null;
  children?: string[];
  props?: Partial<NodePropsByKind[K]>;
  style?: Partial<NodeStyle>;
  layout?: Partial<NodeLayout>;
  responsive?: NodeResponsive;
  visibility?: Partial<NodeVisibility>;
};

export function createNode<K extends NodeKind>(input: CreateNodeInput<K>): BuilderNode<K> {
  const defaults = defaultPropsForKind(input.kind);
  return {
    id: createNodeId(input.kind),
    kind: input.kind,
    name: input.name,
    children: input.children ?? [],
    parentId: input.parentId ?? null,
    props: { ...defaults, ...input.props } as NodePropsByKind[K],
    style: { ...emptyStyle(), ...input.style },
    layout: { ...emptyLayout(), ...input.layout },
    responsive: input.responsive ?? emptyResponsive(),
    visibility: { ...emptyVisibility(), ...input.visibility },
  };
}

function defaultPropsForKind(kind: NodeKind): NodePropsByKind[NodeKind] {
  switch (kind) {
    case 'frame':
      return { label: 'Frame' } satisfies FrameNodeProps;
    case 'stack':
      return { label: 'Stack' } satisfies StackNodeProps;
    case 'section':
      return { label: 'Section' } satisfies SectionNodeProps;
    case 'text':
      return { text: '', content: '', tag: 'p', editable: true, typographyToken: 'body' } satisfies TextNodeProps;
    case 'image':
      return {
        src: '',
        alt: '',
        fit: 'cover',
        overlayEnabled: false,
        overlayColor: '#000000',
        overlayOpacity: 35,
        overlayGradient: true,
        overlayDirection: 'to-bottom',
        overlayBlendMode: 'normal',
      } satisfies ImageNodeProps;
    case 'button':
      return { label: 'Button', variant: 'primary' } satisfies ButtonNodeProps;
    case 'form':
      return {
        title: 'Réservez votre essai',
        subtitle: 'Remplissez le formulaire pour être recontacté.',
        submitLabel: 'Suivant',
        consentLabel: "J'accepte d'être contacté par Auto Hall.",
        stepCount: 3,
        currentStepLabel: 'Étape 1/3',
        showConsent: true,
        fields: [
          { id: 'model', label: 'Modèle', enabled: true, required: true },
          { id: 'city', label: 'Ville', enabled: true, required: true },
          { id: 'date', label: 'Date', enabled: true, required: false },
          { id: 'name', label: 'Nom', enabled: true, required: true },
          { id: 'phone', label: 'Téléphone', enabled: true, required: true },
          { id: 'consent', label: 'Consentement', enabled: true, required: true },
        ],
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
      } satisfies FormNodeProps;
    case 'card':
      return { elevation: 'md' } satisfies CardNodeProps;
    case 'input':
      return { label: 'Input', placeholder: '', inputType: 'text', required: false } satisfies InputNodeProps;
    default:
      return {} as NodePropsByKind[NodeKind];
  }
}

export function linkParentChild(
  nodes: Record<string, BuilderNode>,
  parentId: string,
  childId: string,
): Record<string, BuilderNode> {
  const parent = nodes[parentId];
  const child = nodes[childId];
  if (!parent || !child) return nodes;

  return {
    ...nodes,
    [parentId]: {
      ...parent,
      children: parent.children.includes(childId) ? parent.children : [...parent.children, childId],
    },
    [childId]: { ...child, parentId },
  };
}

export function buildDocument(nodes: Record<string, BuilderNode>, rootId: string, meta: BuilderDocument['meta']): BuilderDocument {
  return { version: 4, rootId, nodes, meta };
}
