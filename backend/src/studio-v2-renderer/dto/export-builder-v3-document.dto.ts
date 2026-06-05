import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class BuilderV3ExportBlockDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  type!: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsObject()
  propsJson!: Record<string, unknown>;
}

export class ExportBuilderV3DocumentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuilderV3ExportBlockDto)
  blocks!: BuilderV3ExportBlockDto[];

  @IsOptional()
  @IsObject()
  pageTheme?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  pageSettings?: Record<string, unknown>;
}
