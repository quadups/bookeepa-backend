import { Module } from '@nestjs/common';
import { BillingModule } from '../billing/billing.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [BillingModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
