import { LandingPageStatus } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateLandingPageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(180)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with hyphens only',
  })
  slug!: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  @MaxLength(255)
  publicBaseUrl?: string;

  @IsOptional()
  @IsEnum(LandingPageStatus)
  status?: LandingPageStatus;
}
