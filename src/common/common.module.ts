import { Global, Module } from '@nestjs/common';
import { IdempotencyService } from './idempotency/idempotency.service';
import { TenancyService } from './tenancy/tenancy.service';

@Global()
@Module({
  providers: [IdempotencyService, TenancyService],
  exports: [IdempotencyService, TenancyService],
})
export class CommonModule {}
