import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LandingPageAsset } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildStoredFilename,
  extractExtension,
  validateUploadFile,
} from './asset-upload.policy';
import { resolveAssetPublicPath } from './asset-export.utils';

export type PageAssetItem = {
  id: string;
  landingPageId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  fileSize: number;
  storagePath: string;
  publicPath: string;
  url: string;
  createdAt: string;
};

type MulterFile = Express.Multer.File;

@Injectable()
export class PageAssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async listForPageVersion(pageVersionId: string): Promise<PageAssetItem[]> {
    const landingPageId = await this.resolveLandingPageId(pageVersionId);

    const assets = await this.prisma.landingPageAsset.findMany({
      where: { landingPageId },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((asset) => this.toItem(asset));
  }

  async uploadForPageVersion(
    pageVersionId: string,
    file: MulterFile | undefined,
  ): Promise<PageAssetItem> {
    if (!file?.buffer?.length) {
      throw new BadRequestException({
        success: false,
        message: 'File is required',
        code: 'ASSET_FILE_REQUIRED',
      });
    }

    const maxBytes = this.resolveMaxFileSize();
    validateUploadFile(
      {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      maxBytes,
    );

    const landingPageId = await this.resolveLandingPageId(pageVersionId);
    const extension = extractExtension(file.originalname);
    const assetId = randomUUID();
    const storedName = buildStoredFilename(extension, assetId);

    const relativeDir = path.posix.join('page-versions', pageVersionId);
    const relativeFilePath = path.posix.join(relativeDir, storedName);
    const absoluteDir = path.join(this.resolveStorageRoot(), relativeDir);
    const absoluteFilePath = path.join(absoluteDir, storedName);

    await mkdir(absoluteDir, { recursive: true });
    await writeFile(absoluteFilePath, file.buffer);

    const publicPath = resolveAssetPublicPath(storedName);

    try {
      const asset = await this.prisma.landingPageAsset.create({
        data: {
          landingPageId,
          originalName: path.basename(file.originalname).slice(0, 255),
          storedName,
          mimeType: file.mimetype,
          fileSize: file.size,
          storagePath: relativeFilePath,
          publicPath,
        },
      });

      return this.toItem(asset);
    } catch (error) {
      await unlink(absoluteFilePath).catch(() => undefined);
      throw error;
    }
  }

  async deleteAsset(assetId: string): Promise<void> {
    const asset = await this.prisma.landingPageAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException({
        success: false,
        message: 'Asset not found',
        code: 'ASSET_NOT_FOUND',
      });
    }

    const absoluteFilePath = path.join(
      this.resolveStorageRoot(),
      asset.storagePath,
    );

    await this.prisma.landingPageAsset.delete({ where: { id: assetId } });
    await unlink(absoluteFilePath).catch(() => undefined);
  }

  async getAssetFile(assetId: string): Promise<{
    absolutePath: string;
    mimeType: string;
    originalName: string;
  }> {
    const asset = await this.prisma.landingPageAsset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException({
        success: false,
        message: 'Asset not found',
        code: 'ASSET_NOT_FOUND',
      });
    }

    const storageRoot = this.resolveStorageRoot();
    const absolutePath = path.resolve(storageRoot, asset.storagePath);
    const resolvedRoot = path.resolve(storageRoot);

    if (
      absolutePath !== resolvedRoot &&
      !absolutePath.startsWith(`${resolvedRoot}${path.sep}`)
    ) {
      throw new NotFoundException({
        success: false,
        message: 'Asset file path is invalid',
        code: 'ASSET_PATH_INVALID',
      });
    }

    return {
      absolutePath,
      mimeType: asset.mimeType,
      originalName: asset.originalName,
    };
  }

  private async resolveLandingPageId(pageVersionId: string): Promise<string> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      select: { landingPageId: true },
    });

    if (!pageVersion) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    return pageVersion.landingPageId;
  }

  private resolveStorageRoot(): string {
    const configured =
      this.configService.get<string>('ASSETS_STORAGE_PATH') ??
      './storage/assets';

    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }

  private resolveMaxFileSize(): number {
    const raw = this.configService.get<string>('ASSETS_MAX_FILE_SIZE');
    const parsed = raw ? Number(raw) : 5_242_880;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 5_242_880;
  }

  private toItem(asset: LandingPageAsset): PageAssetItem {
    const publicPath =
      asset.publicPath ?? resolveAssetPublicPath(asset.storedName);

    return {
      id: asset.id,
      landingPageId: asset.landingPageId,
      originalName: asset.originalName,
      storedName: asset.storedName,
      mimeType: asset.mimeType,
      fileSize: asset.fileSize,
      storagePath: asset.storagePath,
      publicPath,
      url: `/api/assets/${asset.id}/file`,
      createdAt: asset.createdAt.toISOString(),
    };
  }
}
