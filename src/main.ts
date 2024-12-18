import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './modules/seeder/seeder.service';
import { ValidationPipe } from '@nestjs/common';
import  cookieParser from 'cookie-parser';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors()
  await app.listen(process.env.PORT ?? 3000);
  const seederService = app.get(SeederService);
  await seederService.seed();
}
bootstrap();
