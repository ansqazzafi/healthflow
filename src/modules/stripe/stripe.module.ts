import { forwardRef, Module } from '@nestjs/common';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { UserModule } from '../user/user.module';
import { ConfigService } from '@nestjs/config';
import { AppointmentModule } from '../appointment/appointment.module';
import { NodemailerModule } from '../nodemailer/nodemailer.module';
import { ZoomModule } from '../zoom/zoom.module';

@Module({
  imports: [
    NodemailerModule,
    ZoomModule,
    forwardRef(() => AppointmentModule),
    UserModule
  ],
  controllers: [StripeController],
  providers: [StripeService, ConfigService],
  exports: [StripeService]
})
export class StripeModule { }
