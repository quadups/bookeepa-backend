import 'dotenv/config';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AppConfigService } from '../config/config.service';
import { API_PREFIX } from '../http-config';
import { createOpenApiDocument } from '../swagger';

async function generateOpenApi(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  const config = app.get(AppConfigService);

  app.setGlobalPrefix(API_PREFIX);

  const document = createOpenApiDocument(app, config);
  const outputPath = join(process.cwd(), 'openapi', 'bookepa-api.v1.json');

  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  await app.close();
}

generateOpenApi().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
