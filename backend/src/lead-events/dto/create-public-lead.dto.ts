import { LeadRequestType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePublicLeadDto {
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  campaignSlug?: string;

  @IsOptional()
  @IsUUID()
  landingPageId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  landingSlug?: string;

  @IsOptional()
  @IsUUID()
  pageVersionId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(180)
  fullName!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(40)
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(180)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  vehicleModel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsOptional()
  @IsEnum(LeadRequestType)
  requestType?: LeadRequestType;

  @IsOptional()
  @IsUrl({ require_protocol: true, require_tld: false })
  @MaxLength(500)
  sourceUrl?: string;

  @IsOptional()
  @IsObject()
  rawPayload?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
