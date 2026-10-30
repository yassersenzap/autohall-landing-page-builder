import { IsObject } from 'class-validator';

export class SaveStudioDocumentDto {
  @IsObject()
  documentJson!: Record<string, unknown>;
}
