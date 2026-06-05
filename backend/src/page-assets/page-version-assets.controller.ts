import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { memoryStorage } from 'multer';
import { Roles } from '../common/decorators/roles.decorator';
import { PageAssetsService } from './page-assets.service';

const READ_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
  UserRole.VIEWER,
] as const;

const WRITE_ROLES = [
  UserRole.ADMIN,
  UserRole.SI_DIGITAL,
  UserRole.MARKETER,
] as const;

@Controller('api/page-versions/:pageVersionId/assets')
export class PageVersionAssetsController {
  constructor(private readonly pageAssetsService: PageAssetsService) {}

  @Roles(...READ_ROLES)
  @Get()
  async list(@Param('pageVersionId', ParseUUIDPipe) pageVersionId: string) {
    const data = await this.pageAssetsService.listForPageVersion(pageVersionId);

    return {
      success: true,
      data,
      message: 'Page assets retrieved successfully',
    };
  }

  @Roles(...WRITE_ROLES)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5_242_880 },
    }),
  )
  async upload(
    @Param('pageVersionId', ParseUUIDPipe) pageVersionId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const data = await this.pageAssetsService.uploadForPageVersion(
      pageVersionId,
      file,
    );

    return {
      success: true,
      data,
      message: 'Asset uploaded successfully',
    };
  }
}
