import { LeadPriority } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsUUID,
  ValidateIf,
} from 'class-validator';

function emptyToNull(value: unknown): unknown {
  if (value === '' || value === undefined) {
    return null;
  }
  return value;
}

export class UpdateLeadFollowUpDto {
  @IsOptional()
  @Transform(({ value }) => emptyToNull(value))
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  assignedToUserId?: string | null;

  @IsOptional()
  @IsEnum(LeadPriority)
  priority?: LeadPriority;

  @IsOptional()
  @Transform(({ value }) => emptyToNull(value))
  @ValidateIf((_, value) => value !== null)
  @IsDateString()
  nextFollowUpAt?: string | null;
}
