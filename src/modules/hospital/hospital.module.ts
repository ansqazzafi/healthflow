import { Module } from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { HospitalController } from './hospital.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Hospital, HospitalSchema } from './hospital.schema';
import { GlobalAuth } from 'src/common/services/global-auth.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hospital.name, schema: HospitalSchema },
    ]),
  ],
  providers: [HospitalService , GlobalAuth],
  controllers: [HospitalController],
  exports:[HospitalService]
})
export class HospitalModule {}
