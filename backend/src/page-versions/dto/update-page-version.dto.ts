import { PageVersionStatus } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePageVersionDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;

  @IsOptional()
  @IsEnum(PageVersionStatus)
  status?: PageVersionStatus;

  @IsOptional()
  @IsObject()
  themeJson?: Record<string, unknown>;
}
