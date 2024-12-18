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
import { TwilioModule } from '../twilio/twilio.module';
import { AppointmentModule } from '../appointment/appointment.module';
import { TwilioService } from '../twilio/twilio.service';
import { AppointmentService } from '../appointment/appointment.service';
import { Appointment, AppointmentSchema } from '../appointment/appointment.schema';
import { NodemailerModule } from 'src/modules/nodemailer/nodemailer.module';

@Module({
  imports: [
    TwilioModule,
    AppointmentModule,
    NodemailerModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
  ],
  providers: [PatientService, ResponseHandler, JwtService],
  controllers: [PatientController],
  exports: [PatientService],
})
export class PatientModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'patient', method: RequestMethod.PATCH },
        { path: 'patient/:id', method: RequestMethod.GET },
        { path: 'patient', method: RequestMethod.GET },
        { path: 'patient', method: RequestMethod.DELETE },
      );
  }
}
