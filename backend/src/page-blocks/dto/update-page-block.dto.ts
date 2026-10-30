import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ALLOWED_BLOCK_TYPES } from '../constants/allowed-block-types';

export class UpdatePageBlockDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsIn(ALLOWED_BLOCK_TYPES, {
    message: `blockType must be one of: ${ALLOWED_BLOCK_TYPES.join(', ')}`,
  })
  blockType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  propsJson?: Record<string, unknown>;
}
