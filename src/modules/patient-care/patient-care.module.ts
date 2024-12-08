import { Module } from '@nestjs/common';
import { PatientCareController } from './patient-care.controller';
import { PatientCareService } from './patient-care.service';
import { User, UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PatientCareController],
  providers: [PatientCareService],
})
export class PatientCareModule {}
