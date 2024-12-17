import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PatientCareController } from './patient-care.controller';
import { PatientCareService } from './patient-care.service';
import { User, UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { ResponseHandler } from 'utility/success-response';
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PatientCareController],
  providers: [PatientCareService, ResponseHandler, JwtService],
  exports: [PatientCareService]
})
export class PatientCareModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'patient-care', method: RequestMethod.PATCH },
        { path: 'patient-care', method: RequestMethod.GET },
        { path: 'patient-care/:id', method: RequestMethod.GET }
      );
  }
}
