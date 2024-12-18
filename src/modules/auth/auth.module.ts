import { forwardRef, Module, NestModule } from '@nestjs/common';
// import { UserService } from '../user/user.service';
// import { TwilioService } from '../twilio/twilio.service';
// import { DoctorService } from '../doctor/doctor.service';
// import { HospitalService } from '../hospital/hospital.service';
import { ResponseHandler } from 'utility/success-response';
import { UserModule } from '../user/user.module';
import { TwilioModule } from '../twilio/twilio.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwilioService } from '../twilio/twilio.service';
import { HospitalService } from '../hospital/hospital.service';
import { DoctorService } from '../doctor/doctor.service';
import { HospitalModule } from '../hospital/hospital.module';
import { DoctorModule } from '../doctor/doctor.module';
import { JwtService } from '@nestjs/jwt';
import { MiddlewareConsumer } from '@nestjs/common';
import { JwtMiddleware } from 'middlewares/verify-jwt.middlware';
import { NodemailerService } from 'src/modules/nodemailer/nodemailer.service';
import { NodemailerModule } from 'src/modules/nodemailer/nodemailer.module';
@Module({
  imports: [
    TwilioModule,
    HospitalModule,
    DoctorModule,
    UserModule,
    NodemailerModule
  ],
  controllers: [AuthController],
  providers: [ResponseHandler, JwtService, AuthService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes('auth/logout');
  }
}
