import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AppConfigService } from './config/config.service';
import { configureHttpApp } from './http-config';
import { createOpenApiDocument } from './swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  configureHttpApp(app, config);

  if (config.swaggerEnabled) {
    const document = createOpenApiDocument(app, config);

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
