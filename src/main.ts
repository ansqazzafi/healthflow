import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './modules/seeder/seeder.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
  const seederService = app.get(SeederService);
  await seederService.seed();
}
bootstrap();
