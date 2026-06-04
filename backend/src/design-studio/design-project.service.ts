import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DesignEngine, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SaveDesignProjectDto } from './dto/save-design-project.dto';
import {
  DesignSnapshotRejectedError,
  sanitizeDesignCss,
  sanitizeDesignHtml,
  sanitizeDesignProjectJson,
} from './sanitize-design-snapshot';

export type DesignProjectPayload = {
  engine: DesignEngine;
  projectJson: Prisma.JsonValue | null;
  htmlSnapshot: string | null;
  cssSnapshot: string | null;
  updatedAt: string;
};

@Injectable()
export class DesignProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async getDesignProject(pageVersionId: string): Promise<DesignProjectPayload> {
    const version = await this.findVersion(pageVersionId);

    return {
      engine: version.designEngine,
      projectJson: version.designProjectJson,
      htmlSnapshot: version.designHtmlSnapshot,
      cssSnapshot: version.designCssSnapshot,
      updatedAt: version.updatedAt.toISOString(),
    };
  }

  async saveDesignProject(
    pageVersionId: string,
    dto: SaveDesignProjectDto,
  ): Promise<DesignProjectPayload> {
    await this.findVersion(pageVersionId);

    try {
      const projectJson = sanitizeDesignProjectJson(dto.projectJson);
      const htmlSnapshot = sanitizeDesignHtml(dto.htmlSnapshot);
      const cssSnapshot = sanitizeDesignCss(dto.cssSnapshot);
      const engine = dto.engine ?? DesignEngine.grapesjs;

      const updated = await this.prisma.pageVersion.update({
        where: { id: pageVersionId },
        data: {
          designEngine: engine,
          designProjectJson: projectJson as Prisma.InputJsonValue,
          designHtmlSnapshot: htmlSnapshot,
          designCssSnapshot: cssSnapshot,
        },
      });

      return {
        engine: updated.designEngine,
        projectJson: updated.designProjectJson,
        htmlSnapshot: updated.designHtmlSnapshot,
        cssSnapshot: updated.designCssSnapshot,
        updatedAt: updated.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err instanceof DesignSnapshotRejectedError) {
        throw new BadRequestException({
          success: false,
          message: err.message,
          code: 'DESIGN_SNAPSHOT_REJECTED',
        });
      }
      throw err;
    }
  }

  async switchToGrapesjs(pageVersionId: string): Promise<DesignProjectPayload> {
    await this.findVersion(pageVersionId);

    const emptyProject = {
      pages: [
        {
          frames: [
            {
              component: {
                type: 'wrapper',
                components: [
                  {
                    type: 'section',
                    classes: ['lp-section', 'ah-section'],
                    components: [
                      {
                        tagName: 'div',
                        classes: ['lp-section', 'container'],
                        components: [
                          {
                            tagName: 'h1',
                            type: 'text',
                            content: '',
                            classes: ['ah-heading'],
                          },
                          {
                            tagName: 'p',
                            type: 'text',
                            content: '',
                            classes: ['ah-text'],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const updated = await this.prisma.pageVersion.update({
      where: { id: pageVersionId },
      data: {
        designEngine: DesignEngine.grapesjs,
        designProjectJson: emptyProject as Prisma.InputJsonValue,
        designHtmlSnapshot: '<main class="lp-page"></main>',
        designCssSnapshot: '',
      },
    });

    return {
      engine: updated.designEngine,
      projectJson: updated.designProjectJson,
      htmlSnapshot: updated.designHtmlSnapshot,
      cssSnapshot: updated.designCssSnapshot,
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  private async findVersion(pageVersionId: string) {
    const version = await this.prisma.pageVersion.findUnique({
      where: { id: pageVersionId },
    });

    if (!version) {
      throw new NotFoundException({
        success: false,
        message: 'Page version not found',
        code: 'PAGE_VERSION_NOT_FOUND',
      });
    }

    return version;
  }
}
