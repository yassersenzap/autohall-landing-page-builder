import { LeadEventStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

const MANAGEABLE_STATUSES = [
  LeadEventStatus.RECEIVED,
  LeadEventStatus.CONTACTED,
  LeadEventStatus.QUALIFIED,
  LeadEventStatus.REJECTED,
  LeadEventStatus.ARCHIVED,
] as const;

export class UpdateLeadStatusDto {
  @IsEnum(MANAGEABLE_STATUSES)
  status!: LeadEventStatus;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  internalComment?: string;
}
