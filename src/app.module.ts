import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BillingModule } from './billing/billing.module';
import { BusinessesModule } from './businesses/businesses.module';
import { CategoriesModule } from './categories/categories.module';
import { CommonModule } from './common/common.module';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { ResponseSerializationInterceptor } from './common/interceptors/response-serialization.interceptor';
import { ConfigModule } from './config/config.module';
import { CustomersModule } from './customers/customers.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MessagesModule } from './messages/messages.module';
import { PricingModule } from './pricing/pricing.module';
import { PrismaModule } from './prisma/prisma.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CommonModule,
    AuthModule,
    BillingModule,
    PricingModule,
    BusinessesModule,
    CustomersModule,
    CategoriesModule,
    TransactionsModule,
    InvoicesModule,
    MessagesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSerializationInterceptor,
    },
  ],
})
export class AppModule {}
