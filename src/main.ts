import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe with DTOs
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

  // Enable CORS for all routes
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Bookeepa API')
    .setDescription('API documentation for Bookeepa backend service')
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
    .addTag('business', 'Business management endpoints')
    .addTag('customers', 'Customer management endpoints')
    .addTag('invoices', 'Invoice management endpoints')
    .addTag('transactions', 'Transaction management endpoints')
    .addTag('dashboard', 'Dashboard endpoints')
    .addTag('messages', 'Messaging endpoints')
    .setContact(
      'Bookeepa Support',
      'https://bookeepa.com',
      'support@bookeepa.com',
    )
    .setLicense('Proprietary', '')
    .addServer(
      process.env.API_URL || 'http://localhost:3000',
      process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Only enable Swagger UI in development or if explicitly enabled
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_SWAGGER === 'true'
  ) {
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorizationData: true,
        displayOperationId: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
      },
      customCss: '.swagger-ui { font-family: "Segoe UI", sans-serif; }',
      customSiteTitle: 'Bookeepa API Documentation',
    });

    console.log(
      `📚 Swagger documentation available at: ${process.env.API_URL || 'http://localhost:3000'}/api/docs`,
    );
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(
    `✅ Application running on port ${port} (${process.env.NODE_ENV || 'development'})`,
  );
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});
