import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { access } from 'fs/promises';
import * as path from 'path';
import { buildPublicAssetFileUrl } from '../landing-render/render-asset.resolve';
import type { RenderAssetMap } from '../landing-render/render-asset.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  extractUsedAssetIdsFromBlocks,
  extractUsedAssetIdsFromPuckDocument,
  resolveAssetPublicPath,
} from './asset-export.utils';

@Injectable()
export class AssetRenderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Charge les assets référencés par les blocs et construit la map pour landing-render.
   */
  async buildAssetMapForBlocks(
    blocks: Array<{ propsJson: Prisma.JsonValue }>,
    mode: 'preview' | 'export',
  ): Promise<RenderAssetMap> {
    const assetIds = extractUsedAssetIdsFromBlocks(blocks);
    if (assetIds.length === 0) {
      return {};
    }

    const assets = await this.prisma.landingPageAsset.findMany({
      where: { id: { in: assetIds } },
    });

    const storageRoot = this.resolveStorageRoot();
    const previewBase =
      mode === 'preview' ? this.resolvePublicApiBase() : '';
    const map: RenderAssetMap = {};

    for (const asset of assets) {
      const absolutePath = path.join(storageRoot, asset.storagePath);
      const exists = await access(absolutePath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        continue;
      }

      const exportPath =
        asset.publicPath ?? resolveAssetPublicPath(asset.storedName);

      map[asset.id] = {
        previewUrl: buildPublicAssetFileUrl(previewBase, asset.id),
        exportPath,
        storagePath: asset.storagePath,
        storedName: asset.storedName,
        mimeType: asset.mimeType,
        absolutePath,
      };
    }

    return map;
  }

  async buildAssetMapForPuckDocument(
    document: Record<string, unknown>,
    mode: 'preview' | 'export',
  ): Promise<RenderAssetMap> {
    const assetIds = extractUsedAssetIdsFromPuckDocument(document);
    if (assetIds.length === 0) return {};

    const assets = await this.prisma.landingPageAsset.findMany({
      where: { id: { in: assetIds } },
    });

    const storageRoot = this.resolveStorageRoot();
    const previewBase = mode === 'preview' ? this.resolvePublicApiBase() : '';
    const map: RenderAssetMap = {};

    for (const asset of assets) {
      const absolutePath = path.join(storageRoot, asset.storagePath);
      const exists = await access(absolutePath)
        .then(() => true)
        .catch(() => false);
      if (!exists) continue;

      map[asset.id] = {
        previewUrl: buildPublicAssetFileUrl(previewBase, asset.id),
        exportPath: asset.publicPath ?? resolveAssetPublicPath(asset.storedName),
        storagePath: asset.storagePath,
        storedName: asset.storedName,
        mimeType: asset.mimeType,
        absolutePath,
      };
    }

    return map;
  }

  resolveStorageRoot(): string {
    const configured =
      this.configService.get<string>('ASSETS_STORAGE_PATH') ??
      './storage/assets';

    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }

  resolvePublicApiBase(): string {
    const configured = this.configService.get<string>('PUBLIC_API_BASE_URL');
    if (configured?.trim()) {
      return configured.trim().replace(/\/$/, '');
    }

    const port = Number(
      this.configService.get<string>('BACKEND_PORT') ?? '3000',
    );
    return `http://localhost:${port}`;
  }
}
