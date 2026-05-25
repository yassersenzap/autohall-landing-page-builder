import { apiRequest } from './api';
import { DEFAULT_LEAD_FORM_PROPS } from './lead-form-block';

export const BLOCK_TYPES = ['hero', 'text', 'image', 'button', 'lead_form'] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export type PageBlockItem = {
  id: string;
  pageVersionId: string;
  blockKey: string;
  blockType: string;
  sortOrder: number;
  propsJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type CreatePageBlockPayload = {
  blockType: BlockType;
  propsJson: Record<string, unknown>;
  sortOrder?: number;
  blockKey?: string;
};

export const DEFAULT_BLOCK_PROPS: Record<BlockType, Record<string, unknown>> = {
  hero: {
    title: 'Titre principal',
    subtitle: 'Sous-titre',
    buttonText: 'En savoir plus',
    buttonTarget: '#lead-form',
  },
  text: {
    content: 'Votre texte ici.',
  },
  image: {
    src: 'https://example.com/image.jpg',
    alt: 'Description de l’image',
  },
  button: {
    text: 'Cliquez ici',
    href: '#lead-form',
  },
  lead_form: DEFAULT_LEAD_FORM_PROPS,
};

function pageBlocksBase(pageVersionId: string): string {
  return `/api/page-versions/${pageVersionId}/blocks`;
}

export async function listPageBlocks(pageVersionId: string) {
  return apiRequest<PageBlockItem[]>(pageBlocksBase(pageVersionId));
}

export async function createPageBlock(
  pageVersionId: string,
  payload: CreatePageBlockPayload,
) {
  return apiRequest<PageBlockItem>(pageBlocksBase(pageVersionId), {
    method: 'POST',
    body: payload,
  });
}

export function canManagePageBlocks(role: string): boolean {
  return role === 'ADMIN' || role === 'SI_DIGITAL' || role === 'MARKETER';
}
