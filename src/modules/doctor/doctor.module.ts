import { forwardRef, Module } from '@nestjs/common';
import { Doctor, DoctorSchema } from './doctor.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { ResponseHandler } from 'utility/success-response';
import { AuthModule } from '../auth/auth.module';
MongooseModule;
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doctor.name, schema: DoctorSchema }]),
  ],
  providers: [DoctorService, ResponseHandler],
  controllers: [DoctorController],
  exports: [DoctorService],
})
export class DoctorModule {}
