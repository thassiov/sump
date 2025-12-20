import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Sump API')
    .setDescription('Simple User Management Platform')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
