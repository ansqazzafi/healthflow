import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TwilioService } from './modules/twilio/twilio.service';
import { ResponseHandler } from 'utility/success-response';
import { AuthModule } from './modules/auth/auth.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { UserService } from './modules/user/user.service';
import { SeederService } from './modules/seeder/seeder.service';
import { User, UserSchema } from './modules/user/user.schema';
import { UserModule } from './modules/user/user.module';
import { AuthController } from './modules/auth/auth.controller';
import { DoctorService } from './modules/doctor/doctor.service';
import { HospitalService } from './modules/hospital/hospital.service';
import { DoctorModule } from './modules/doctor/doctor.module';
import { HospitalModule } from './modules/hospital/hospital.module';
import { AuthService } from './modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { GlobalAuth } from './common/services/global-auth.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
    TwilioModule,
    UserModule,
    DoctorModule,
    HospitalModule,

  ],
  providers: [
    ResponseHandler,
    // SeederService,
    // JwtService,
    // GlobalAuth
  ],
})
export class AppModule { }
