import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './modules/admin/admin.controller';
import { AdminService } from './modules/admin/admin.service';
import { AdminModule } from './modules/admin/admin.module';
import { AppointmentController } from './modules/appointment/appointment.controller';
import { AuthController } from './modules/auth/auth.controller';
import { ChatbotController } from './modules/chatbot/chatbot.controller';
import { DoctorController } from './modules/doctor/doctor.controller';
import { HospitalController } from './modules/hospital/hospital.controller';
import { JazzcashController } from './modules/jazzcash/jazzcash.controller';
import { PatientCareController } from './modules/patient-care/patient-care.controller';
import { PatientController } from './modules/patient/patient.controller';
import { AppointmentService } from './modules/appointment/appointment.service';
import { AuthService } from './modules/auth/auth.service';
import { ChatbotService } from './modules/chatbot/chatbot.service';
import { DoctorService } from './modules/doctor/doctor.service';
import { HospitalService } from './modules/hospital/hospital.service';
import { JazzcashService } from './modules/jazzcash/jazzcash.service';
import { PatientService } from './modules/patient/patient.service';
import { PatientCareService } from './modules/patient-care/patient-care.service';
import { TwilioService } from './modules/twilio/twilio.service';
import { ResponseHandler } from 'utility/success-response';
import { PatientModule } from './modules/patient/patient.module';
import { HospitalModule } from './modules/hospital/hospital.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { JazzcashModule } from './modules/jazzcash/jazzcash.module';
import { PatientCareModule } from './modules/patient-care/patient-care.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { AuthModule } from './modules/auth/auth.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { UserService } from './modules/user/user.service';
import { SeederService } from './modules/seeder/seeder.service';
import { User, UserSchema } from './modules/user/user.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AdminModule,
    PatientModule,
    HospitalModule,
    DoctorModule,
    JazzcashModule,
    PatientCareModule,
    ChatbotModule,
    AppointmentModule,
    AuthModule,
    TwilioModule,
  ],
  controllers: [
    AdminController,
    AppointmentController,
    AuthController,
    ChatbotController,
    DoctorController,
    HospitalController,
    JazzcashController,
    PatientCareController,
    PatientController,
  ],
  providers: [
    AdminService,
    AppointmentService,
    AuthService,
    ChatbotService,
    DoctorService,
    HospitalService,
    JazzcashService,
    PatientService,
    PatientCareService,
    TwilioService,
    ResponseHandler,
    UserService,
    SeederService,
  ],
})
export class AppModule {}
