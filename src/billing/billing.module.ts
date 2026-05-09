import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { EntitlementsService } from './entitlements.service';

@Module({
  controllers: [BillingController],
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class BillingModule {}
