import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertStudioV2DocumentDto {
  @IsObject()
  documentJson!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  engine?: string;
}
