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
import { Appointment, AppointmentSchema } from './modules/appointment/appointment.schema';
import { PatientModule } from './modules/patient/patient.module';
import { PatientCareModule } from './modules/patient-care/patient-care.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { DepartmentController } from './modules/department/department.controller';
import { DepartmentService } from './modules/department/department.service';
import { DepartmentModule } from './modules/department/department.module';
import { NodemailerService } from './modules/nodemailer/nodemailer.service';
import { NodemailerModule } from './modules/nodemailer/nodemailer.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { StripeService } from './modules/stripe/stripe.service';
import { StripeModule } from './modules/stripe/stripe.module';
import { GoogleMeetModule } from './modules/google-meet/google-meet.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: Appointment.name, schema: AppointmentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ChatbotModule,
    AuthModule,
    TwilioModule,
    DoctorModule,
    HospitalModule,
    AdminModule,
    PatientModule,
    PatientCareModule,
    AppointmentModule,
    DepartmentModule,
    NodemailerModule,
    NodemailerModule,
    StripeModule,
    GoogleMeetModule
  ],
  providers: [ResponseHandler, SeederService, DepartmentService, NodemailerService]
})
export class AppModule { }
