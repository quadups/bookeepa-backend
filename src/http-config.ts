import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/config.service';

export const API_VERSION = 'v1';
export const API_PREFIX = `api/${API_VERSION}`;

export function configureHttpApp(
  app: INestApplication,
  config: AppConfigService,
): void {
  app.setGlobalPrefix(API_PREFIX);
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
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });
}
