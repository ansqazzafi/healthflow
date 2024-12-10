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
import { DoctorModule } from './modules/doctor/doctor.module';
import { HospitalModule } from './modules/hospital/hospital.module';
import { AdminModule } from './modules/admin/admin.module';
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
    AdminModule
  ],
  providers: [ResponseHandler, SeederService],
})
export class AppModule {}
