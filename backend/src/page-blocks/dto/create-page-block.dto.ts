import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ALLOWED_BLOCK_TYPES } from '../constants/allowed-block-types';

export class CreatePageBlockDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsIn(ALLOWED_BLOCK_TYPES, {
    message: `blockType must be one of: ${ALLOWED_BLOCK_TYPES.join(', ')}`,
  })
  blockType!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/^[a-z0-9_]+(?:-[a-z0-9_]+)*$/, {
    message:
      'blockKey must be lowercase alphanumeric with underscores or hyphens',
  })
  blockKey?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsObject()
  propsJson!: Record<string, unknown>;
}
