import { Module } from '@nestjs/common';
import { Doctor, DoctorSchema } from './doctor.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { ResponseHandler } from 'utility/success-response';
import { GlobalAuth } from 'src/common/services/global-auth.service';
MongooseModule;
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
  ],
  providers: [DoctorService, ResponseHandler , GlobalAuth],
  controllers: [DoctorController],
  exports:[DoctorService]
})
export class DoctorModule {}
