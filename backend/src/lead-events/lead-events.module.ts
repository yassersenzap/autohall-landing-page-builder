import { Module } from '@nestjs/common';
import { LeadEventsController } from './lead-events.controller';
import { LeadEventsService } from './lead-events.service';
import { PublicLeadsController } from './public-leads.controller';

@Module({
  controllers: [PublicLeadsController, LeadEventsController],
  providers: [LeadEventsService],
  exports: [LeadEventsService],
})
export class LeadEventsModule {}
