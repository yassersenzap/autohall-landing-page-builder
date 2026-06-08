import type { BuilderDocumentBlock } from '../types';
import type { PageSettingsDraft, PageThemeDraft } from '../store/builder-document.store';

/**
 * Document éditable du Landing Studio — contrat stable frontend ↔ export.
 * La persistance API et localStorage sérialisent cette structure.
 */
export type BuilderDocument = {
  blocks: BuilderDocumentBlock[];
  pageTheme: PageThemeDraft;
  pageSettings: PageSettingsDraft;
};

export type BuilderDocumentMeta = {
  pageVersionId: string;
  updatedAt?: string;
};

export type BuilderDocumentSnapshot = BuilderDocument & {
  meta?: BuilderDocumentMeta;
};

/** Payload minimal envoyé à l’export ZIP V3 (sans logique UI). */
export type BuilderExportDocument = {
  blocks: BuilderDocumentBlock[];
  pageTheme: Record<string, unknown>;
  pageSettings: Record<string, unknown>;
};

export function toExportDocument(
  doc: Pick<BuilderDocument, 'blocks' | 'pageTheme' | 'pageSettings'>,
): BuilderExportDocument {
  return {
    blocks: doc.blocks,
    pageTheme: { ...doc.pageTheme },
    pageSettings: { ...doc.pageSettings },
  };
}
