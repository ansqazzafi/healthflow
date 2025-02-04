import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorModule } from '../doctor/doctor.module';
import { ResponseHandler } from 'utility/success-response';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AppointmentModule } from '../appointment/appointment.module';
import {
  Appointment,
  AppointmentSchema,
} from '../appointment/appointment.schema';
import { User, UserSchema } from '../user/user.schema';
@Module({
  imports: [
    DoctorModule,
    AppointmentModule,
    UserModule,
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [HospitalService, ResponseHandler, JwtService],
  controllers: [HospitalController],
  exports: [HospitalService, MongooseModule],
})
export class HospitalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'hospital', method: RequestMethod.PATCH },
      );
  }
}
