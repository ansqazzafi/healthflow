import { Module } from '@nestjs/common';
import { PatientCareController } from './patient-care.controller';
import { PatientCareService } from './patient-care.service';

@Module({
  controllers: [PatientCareController],
  providers: [PatientCareService]
})
export class PatientCareModule {}
