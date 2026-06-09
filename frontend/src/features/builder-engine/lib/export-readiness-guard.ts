import type { PageSettingsDraft } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';

export type ExportReadinessIssue = {
  blockId: string;
  blockType: string;
  path: string;
  kind: 'blob' | 'unbound_public_asset_url';
};

const PUBLIC_ASSET_URL_RE =
  /\/api\/public\/assets\/([0-9a-f-]{36})\/file/i;

function isBlobUrl(value: unknown): boolean {
  return typeof value === 'string' && value.trim().startsWith('blob:');
}

function extractAssetIdFromPublicUrl(value: string): string | null {
  const match = value.match(PUBLIC_ASSET_URL_RE);
  return match?.[1] ?? null;
}

function walkValue(
  value: unknown,
  path: string,
  block: BuilderDocumentBlock,
  issues: ExportReadinessIssue[],
  knownAssetIds: Set<string>,
): void {
  if (isBlobUrl(value)) {
    issues.push({
      blockId: block.id,
      blockType: block.type,
      path,
      kind: 'blob',
    });
    return;
  }

  if (typeof value === 'string') {
    const assetId = extractAssetIdFromPublicUrl(value);
    if (assetId && !knownAssetIds.has(assetId)) {
      issues.push({
        blockId: block.id,
        blockType: block.type,
        path,
        kind: 'unbound_public_asset_url',
      });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkValue(item, `${path}[${index}]`, block, issues, knownAssetIds);
    });
    return;
  }

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nestedAssetId =
      typeof record.imageAssetId === 'string' ? record.imageAssetId.trim() : '';
    if (nestedAssetId) {
      knownAssetIds.add(nestedAssetId);
    }

    for (const [key, nested] of Object.entries(record)) {
      if (key === 'imageAssetId') continue;
      walkValue(
        nested,
        path ? `${path}.${key}` : key,
        block,
        issues,
        knownAssetIds,
      );
    }
  }
}

function collectKnownAssetIds(value: unknown, ids: Set<string>): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectKnownAssetIds(item, ids));
    return;
  }
  if (!value || typeof value !== 'object') return;

  const record = value as Record<string, unknown>;
  const assetId = record.imageAssetId;
  if (typeof assetId === 'string' && assetId.trim()) {
    ids.add(assetId.trim());
  }
  for (const nested of Object.values(record)) {
    if (nested !== null && typeof nested === 'object') {
      collectKnownAssetIds(nested, ids);
    }
  }
}

export function findExportReadinessIssues(input: {
  blocks: BuilderDocumentBlock[];
  pageSettings: PageSettingsDraft;
}): ExportReadinessIssue[] {
  const issues: ExportReadinessIssue[] = [];

  for (const block of input.blocks) {
    const knownAssetIds = new Set<string>();
    collectKnownAssetIds(block.propsJson, knownAssetIds);
    walkValue(block.propsJson, 'propsJson', block, issues, knownAssetIds);
  }

  const settingsAssetIds = new Set<string>();
  if (input.pageSettings.ogImageAssetId?.trim()) {
    settingsAssetIds.add(input.pageSettings.ogImageAssetId.trim());
  }
  if (input.pageSettings.faviconAssetId?.trim()) {
    settingsAssetIds.add(input.pageSettings.faviconAssetId.trim());
  }

  for (const field of ['ogImageUrl', 'faviconUrl'] as const) {
    const value = input.pageSettings[field];
    if (isBlobUrl(value)) {
      issues.push({
        blockId: 'page-settings',
        blockType: 'page_settings',
        path: `pageSettings.${field}`,
        kind: 'blob',
      });
      continue;
    }
    if (typeof value === 'string') {
      const assetId = extractAssetIdFromPublicUrl(value);
      if (assetId && !settingsAssetIds.has(assetId)) {
        issues.push({
          blockId: 'page-settings',
          blockType: 'page_settings',
          path: `pageSettings.${field}`,
          kind: 'unbound_public_asset_url',
        });
      }
    }
  }

  return issues;
}

export function formatExportReadinessError(issues: ExportReadinessIssue[]): string {
  if (issues.length === 0) return '';

  const blobIssues = issues.filter((issue) => issue.kind === 'blob');
  if (blobIssues.length > 0) {
    const sample = blobIssues
      .slice(0, 2)
      .map((issue) =>
        issue.blockType === 'page_settings'
          ? 'paramètres page'
          : issue.blockType,
      )
      .join(', ');
    return `Export bloqué : médias non enregistrés (${sample}). Importez les images via la bibliothèque de la page avant d’exporter.`;
  }

  const urlIssues = issues.filter((issue) => issue.kind === 'unbound_public_asset_url');
  const sample = urlIssues
    .slice(0, 2)
    .map((issue) =>
      issue.blockType === 'page_settings' ? 'paramètres page' : issue.blockType,
    )
    .join(', ');
  return `Export bloqué : URL d’aperçu API détectée sans identifiant d’asset (${sample}). Réimportez ou resélectionnez l’image depuis la bibliothèque.`;
}

export class ExportReadinessError extends Error {
  readonly issues: ExportReadinessIssue[];

  constructor(issues: ExportReadinessIssue[]) {
    super(formatExportReadinessError(issues));
    this.name = 'ExportReadinessError';
    this.issues = issues;
  }
}

export function assertExportReady(input: {
  blocks: BuilderDocumentBlock[];
  pageSettings: PageSettingsDraft;
}): void {
  const issues = findExportReadinessIssues(input);
  if (issues.length > 0) {
    throw new ExportReadinessError(issues);
  }
}
