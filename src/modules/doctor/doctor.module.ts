import { forwardRef, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { ResponseHandler } from 'utility/success-response';
import { TwilioModule } from '../twilio/twilio.module';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { UserModule } from '../user/user.module';
import { JwtService } from '@nestjs/jwt';
import { AppointmentModule } from '../appointment/appointment.module';
import { Appointment, AppointmentSchema } from '../appointment/appointment.schema';
import { NodemailerModule } from 'src/nodemailer/nodemailer.module';
MongooseModule;
@Module({
  imports: [
    TwilioModule,
    UserModule,
    AppointmentModule,
    NodemailerModule,
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),

  ],
  providers: [DoctorService, ResponseHandler, JwtService],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'doctor', method: RequestMethod.POST },
        { path: 'doctor', method: RequestMethod.PATCH },
        { path: 'doctor/:doctorId', method: RequestMethod.DELETE },
      );
  }
}
