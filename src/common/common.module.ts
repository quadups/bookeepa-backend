import { Global, Module } from '@nestjs/common';
import { TenancyService } from './tenancy/tenancy.service';

@Global()
@Module({
  providers: [TenancyService],
  exports: [TenancyService],
})
export class CommonModule {}
