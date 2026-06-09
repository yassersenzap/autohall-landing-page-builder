import type { PageSettingsDraft } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';

export type BlobUrlIssue = {
  blockId: string;
  blockType: string;
  path: string;
};

function isBlobUrl(value: unknown): boolean {
  return typeof value === 'string' && value.trim().startsWith('blob:');
}

function walkValue(
  value: unknown,
  path: string,
  block: BuilderDocumentBlock,
  issues: BlobUrlIssue[],
): void {
  if (isBlobUrl(value)) {
    issues.push({
      blockId: block.id,
      blockType: block.type,
      path,
    });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkValue(item, `${path}[${index}]`, block, issues);
    });
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      walkValue(nested, path ? `${path}.${key}` : key, block, issues);
    }
  }
}

/** Detects ephemeral blob: URLs inside block props (not exportable / not persistable). */
export function findBlobUrlsInBlocks(blocks: BuilderDocumentBlock[]): BlobUrlIssue[] {
  const issues: BlobUrlIssue[] = [];
  for (const block of blocks) {
    walkValue(block.propsJson, 'propsJson', block, issues);
  }
  return issues;
}

const PAGE_SETTINGS_URL_FIELDS: Array<keyof PageSettingsDraft> = [
  'ogImageUrl',
  'faviconUrl',
];

export function findBlobUrlsInPageSettings(pageSettings: PageSettingsDraft): BlobUrlIssue[] {
  const issues: BlobUrlIssue[] = [];
  for (const field of PAGE_SETTINGS_URL_FIELDS) {
    const value = pageSettings[field];
    if (isBlobUrl(value)) {
      issues.push({
        blockId: 'page-settings',
        blockType: 'page_settings',
        path: `pageSettings.${field}`,
      });
    }
  }
  return issues;
}

export function findBlobUrlsInDocument(input: {
  blocks: BuilderDocumentBlock[];
  pageSettings: PageSettingsDraft;
}): BlobUrlIssue[] {
  return [...findBlobUrlsInBlocks(input.blocks), ...findBlobUrlsInPageSettings(input.pageSettings)];
}

export function formatBlobUrlError(issues: BlobUrlIssue[]): string {
  if (issues.length === 0) {
    return '';
  }
  const sample = issues
    .slice(0, 3)
    .map((issue) =>
      issue.blockType === 'page_settings'
        ? `paramètres page (${issue.path})`
        : `${issue.blockType} (${issue.path})`,
    )
    .join(', ');
  const suffix = issues.length > 3 ? ` (+${issues.length - 3} autres)` : '';
  return `Médias non enregistrés détectés : ${sample}${suffix}. Importez les images via la bibliothèque avant de sauvegarder ou exporter.`;
}

export class BlobUrlValidationError extends Error {
  readonly issues: BlobUrlIssue[];

  constructor(issues: BlobUrlIssue[]) {
    super(formatBlobUrlError(issues));
    this.name = 'BlobUrlValidationError';
    this.issues = issues;
  }
}

export function assertNoBlobUrlsInBlocks(blocks: BuilderDocumentBlock[]): void {
  const issues = findBlobUrlsInBlocks(blocks);
  if (issues.length > 0) {
    throw new BlobUrlValidationError(issues);
  }
}

export function assertNoBlobUrlsInDocument(input: {
  blocks: BuilderDocumentBlock[];
  pageSettings: PageSettingsDraft;
}): void {
  const issues = findBlobUrlsInDocument(input);
  if (issues.length > 0) {
    throw new BlobUrlValidationError(issues);
  }
}
