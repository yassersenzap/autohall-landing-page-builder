import { describe, expect, it } from 'vitest';
import {
  assertExportReady,
  ExportReadinessError,
  findExportReadinessIssues,
} from './export-readiness-guard';
import { DEFAULT_PAGE_SETTINGS } from '../store/builder-document.store';
import type { BuilderDocumentBlock } from '../types';

describe('export-readiness-guard', () => {
  const baseBlock: BuilderDocumentBlock = {
    id: 'block-1',
    type: 'media_only',
    label: 'Visuel',
    sortOrder: 1,
    propsJson: {},
  };

  it('blocks export when blob URLs are present', () => {
    const blocks: BuilderDocumentBlock[] = [
      {
        ...baseBlock,
        propsJson: { imageUrl: 'blob:http://localhost/abc' },
      },
    ];

    expect(() =>
      assertExportReady({ blocks, pageSettings: DEFAULT_PAGE_SETTINGS }),
    ).toThrow(ExportReadinessError);
  });

  it('blocks export when public asset URL lacks imageAssetId', () => {
    const blocks: BuilderDocumentBlock[] = [
      {
        ...baseBlock,
        propsJson: {
          imageUrl:
            'http://localhost:3000/api/public/assets/22222222-2222-2222-2222-222222222222/file',
        },
      },
    ];

    const issues = findExportReadinessIssues({
      blocks,
      pageSettings: DEFAULT_PAGE_SETTINGS,
    });
    expect(issues.some((issue) => issue.kind === 'unbound_public_asset_url')).toBe(true);
  });

  it('allows public preview URL when matching imageAssetId is set', () => {
    const assetId = '22222222-2222-2222-2222-222222222222';
    const blocks: BuilderDocumentBlock[] = [
      {
        ...baseBlock,
        propsJson: {
          imageAssetId: assetId,
          imageUrl: `http://localhost:3000/api/public/assets/${assetId}/file`,
        },
      },
    ];

    expect(
      findExportReadinessIssues({ blocks, pageSettings: DEFAULT_PAGE_SETTINGS }),
    ).toEqual([]);
  });
});
