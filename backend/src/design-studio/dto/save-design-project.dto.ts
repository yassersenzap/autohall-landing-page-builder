import { DesignEngine } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class SaveDesignProjectDto {
  @IsObject()
  projectJson!: Record<string, unknown>;

  @IsString()
  htmlSnapshot!: string;

  @IsString()
  cssSnapshot!: string;

  @IsOptional()
  @IsEnum(DesignEngine)
  engine?: DesignEngine;
}
