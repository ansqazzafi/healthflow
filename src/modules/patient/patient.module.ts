import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { User, UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientService } from './patient.service';
import { ResponseHandler } from 'utility/success-response';
import { PatientController } from './patient.controller';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [PatientService, ResponseHandler, JwtService],
  controllers: [PatientController],
  exports: [PatientService],
})
export class PatientModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'patient', method: RequestMethod.PATCH });
  }
}
