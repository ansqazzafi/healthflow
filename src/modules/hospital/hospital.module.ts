import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Hospital, HospitalSchema } from './hospital.schema';
import { AuthModule } from '../auth/auth.module';
import { DoctorModule } from '../doctor/doctor.module';
import { ResponseHandler } from 'utility/success-response';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AppointmentModule } from '../appointment/appointment.module';
@Module({
  imports: [
    forwardRef(() => AuthModule),
    DoctorModule,
    UserModule,
    AppointmentModule,
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
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
        'hospital/register-doctor',
        'hospital/doctors',
        'hospital/appointments',
      );
  }
}
