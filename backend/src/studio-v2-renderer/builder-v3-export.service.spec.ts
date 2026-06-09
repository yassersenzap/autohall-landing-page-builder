import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { BuilderV3ExportService } from './builder-v3-export.service';
import { BuilderV3HtmlCompilerService } from './builder-v3-html-compiler.service';
import { buildBuilderV3ZipEntries } from './builder-v3-export.utils';

const ASSET_ID = '22222222-2222-2222-2222-222222222222';
const pageVersionId = '11111111-1111-1111-1111-111111111111';

describe('BuilderV3ExportService', () => {
  const prisma = {
    pageVersion: { findUnique: jest.fn() },
  };
  const configService = { get: jest.fn() };
  const assetRenderService = {
    buildAssetMapForAssetIds: jest.fn(),
  };
  const htmlCompiler = new BuilderV3HtmlCompilerService();

  const service = new BuilderV3ExportService(
    prisma as never,
    configService as never,
    htmlCompiler,
    assetRenderService as never,
  );

  let assetFilePath: string;

  beforeEach(() => {
    jest.clearAllMocks();
    configService.get.mockReturnValue('https://api.autohall.ma/api/public/leads');

    const tempDir = mkdtempSync(join(tmpdir(), 'v3-export-'));
    assetFilePath = join(tempDir, 'export-hero.png');
    writeFileSync(assetFilePath, Buffer.from('fake-png-content'));

    prisma.pageVersion.findUnique.mockResolvedValue({
      id: pageVersionId,
      versionNumber: 1,
      landingPage: {
        id: 'lp-1',
        slug: 'ford-promo',
        title: 'Ford Promo',
        campaignId: 'camp-1',
        campaign: { name: 'Ford' },
      },
    });

    assetRenderService.buildAssetMapForAssetIds.mockResolvedValue({
      [ASSET_ID]: {
        previewUrl: 'http://localhost:3000/api/public/assets/file',
        exportPath: 'assets/images/export-hero.png',
        storagePath: 'page-versions/pv/export-hero.png',
        storedName: 'export-hero.png',
        mimeType: 'image/png',
        absolutePath: assetFilePath,
      },
    });
  });

  it('bundles uploaded assets in ZIP and emits relative image paths in HTML', async () => {
    const result = await service.exportZip(pageVersionId, {
      blocks: [
        {
          type: 'hero_campaign',
          sortOrder: 1,
          propsJson: {
            title: 'Offre Ford',
            imageAssetId: ASSET_ID,
            alt: 'Hero Ford',
          },
        },
      ],
      pageTheme: {},
      pageSettings: {},
    });

    expect(result.mimeType).toBe('application/zip');
    expect(result.filename).toContain('-v3.zip');
    expect(result.buffer.length).toBeGreaterThan(100);
    expect(result.buffer.toString('latin1')).toContain('assets/images/export-hero.png');

    const html = htmlCompiler.compile({
      pageTitle: 'Offre Ford',
      metaDescription: 'Campagne Ford — Auto Hall',
      primaryColor: '#b91c1c',
      secondaryColor: '#1e293b',
      headingFont: 'Inter',
      bodyFont: 'Roboto',
      blocks: [
        {
          type: 'hero_campaign',
          sortOrder: 1,
          propsJson: {
            title: 'Offre Ford',
            imageAssetId: ASSET_ID,
            alt: 'Hero Ford',
          },
        },
      ],
      renderContext: {
        mode: 'export',
        assetMap: {
          [ASSET_ID]: {
            previewUrl: 'http://localhost:3000/api/public/assets/file',
            exportPath: 'assets/images/export-hero.png',
            storagePath: 'page-versions/pv/export-hero.png',
            storedName: 'export-hero.png',
            mimeType: 'image/png',
            absolutePath: assetFilePath,
          },
        },
      },
    });

    expect(html).toContain('src="assets/images/export-hero.png"');
    expect(html).not.toContain('blob:');
    expect(html).not.toContain('/api/public/assets/');

    const entries = buildBuilderV3ZipEntries({
      indexHtml: html,
      landingConfigJs: 'window.LANDING_CONFIG = {};',
      assetMap: {
        [ASSET_ID]: {
          previewUrl: '',
          exportPath: 'assets/images/export-hero.png',
          storagePath: '',
          storedName: 'export-hero.png',
          mimeType: 'image/png',
          absolutePath: assetFilePath,
        },
      },
    });

    expect(entries.some((e) => e.kind === 'file' && e.path === 'assets/images/export-hero.png')).toBe(
      true,
    );
  });
});
