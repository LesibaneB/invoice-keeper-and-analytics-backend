import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { logger } from './config/winston-logger-configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(7000);
}
bootstrap();
