import { forwardRef, Module } from '@nestjs/common';
import { Doctor, DoctorSchema } from './doctor.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { ResponseHandler } from 'utility/success-response';
import { AuthModule } from '../auth/auth.module';
import { Hospital, HospitalSchema } from '../hospital/hospital.schema';
import { TwilioModule } from '../twilio/twilio.module';
MongooseModule;
@Module({
  imports: [
    TwilioModule,
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
    ]),
  ],
  providers: [DoctorService, ResponseHandler],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
