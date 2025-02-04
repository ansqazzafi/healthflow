import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './modules/seeder/seeder.service';
import { ValidationPipe } from '@nestjs/common';
import  cookieParser from 'cookie-parser';
import * as express from 'express';
import {CustomExceptionFilter} from 'exception-filter/exception-filter'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CustomExceptionFilter());
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors()
  app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
  await app.listen(process.env.PORT ?? 3000);
  const seederService = app.get(SeederService);
  await seederService.seed();
}
bootstrap();
