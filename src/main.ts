import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    origin: config.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  if (config.swaggerEnabled) {
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
      .addServer(config.apiUrl, config.nodeEnv)
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayOperationId: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
      },
      customSiteTitle: 'Bookepa API Documentation',
    });
  }

  await app.listen(config.port);
  console.log(`Bookepa API listening on ${config.apiUrl}`);
}

void bootstrap();
