import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { AppConfigService } from './config/config.service';

export function createOpenApiDocument(
  app: INestApplication,
  config: AppConfigService,
): OpenAPIObject {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Bookepa API')
    .setDescription('Production API contract for the Bookepa backend service.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'Bearer',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('businesses', 'Business onboarding and membership')
    .addTag('customers', 'Customer and debtor records')
    .addTag('categories', 'Income and expense classification')
    .addTag('transactions', 'Bookkeeping transaction records')
    .addTag('invoices', 'Simple invoice workflows')
    .addTag('messages', 'Manual reminder logging')
    .addTag('dashboard', 'Computed business metrics')
    .addTag('pricing', 'Localized pricing metadata')
    .addTag('billing', 'Plan entitlements and usage limits')
    .addServer(config.apiUrl, config.nodeEnv)
    .build();

  return SwaggerModule.createDocument(app, swaggerConfig);
}
