import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PageVersionStatus } from '@prisma/client';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildExportFilename,
  buildIndexHtml,
  STATIC_MAIN_JS,
  STATIC_STYLE_CSS,
} from './static-export.builder';

export type PageExportResult = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

@Injectable()
export class PageExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportZip(pageVersionId: string): Promise<PageExportResult> {
    const pageVersion = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
      include: {
        landingPage: {
          include: { campaign: true },
        },
        blocks: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!pageVersion) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    if (pageVersion.status !== PageVersionStatus.PUBLISHED) {
      throw new BadRequestException({
        success: false,
        message: 'Only published page versions can be exported',
        code: 'PAGE_VERSION_NOT_PUBLISHED',
      });
    }

    const { landingPage, blocks } = pageVersion;

    const indexHtml = buildIndexHtml(
      {
        title: landingPage.title,
        campaignName: landingPage.campaign.name,
        brand: landingPage.campaign.brand,
      },
      blocks,
    );

    const buffer = await this.createZipBuffer({
      'index.html': indexHtml,
      'assets/style.css': STATIC_STYLE_CSS,
      'js/main.js': STATIC_MAIN_JS,
    });

    const filename = buildExportFilename(
      landingPage.slug,
      pageVersion.versionNumber,
    );

    return {
      buffer,
      filename,
      mimeType: 'application/zip',
    };
  }

  private createZipBuffer(files: Record<string, string>): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const stream = new PassThrough();
      const chunks: Buffer[] = [];

      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
      archive.on('error', reject);

      archive.pipe(stream);

      for (const [path, content] of Object.entries(files)) {
        archive.append(content, { name: path });
      }

      void archive.finalize();
    });
  }
}
