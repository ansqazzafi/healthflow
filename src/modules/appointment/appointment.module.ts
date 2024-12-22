import { forwardRef, MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { AppointmentService } from './appointment.service';
import { ResponseHandler } from 'utility/success-response';
import { AppointmentController } from './appointment.controller';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { TwilioModule } from '../twilio/twilio.module';
import { NodemailerModule } from 'src/modules/nodemailer/nodemailer.module';
import { StripeService } from '../stripe/stripe.service';
import { StripeModule } from '../stripe/stripe.module';

MongooseModule;
@Module({
  imports: [
    UserModule,
    TwilioModule,
    NodemailerModule,
    forwardRef(()=>StripeModule),
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, ResponseHandler, JwtService],
  exports: [AppointmentService]
})

export class AppointmentModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'appointment/:hospitalId/:doctorId', method: RequestMethod.POST },
        { path: 'appointment/:appointmentId/:status', method: RequestMethod.PATCH },
        { path: 'appointment/:appointmentId', method: RequestMethod.PATCH },
        { path: 'appointment', method: RequestMethod.GET },
        { path: 'appointment/:appointmentId', method: RequestMethod.GET },
      );
  }
}
