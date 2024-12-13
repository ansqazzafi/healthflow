import { Module } from '@nestjs/common';
import { User, UserSchema } from '../user/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientService } from './patient.service';
import { ResponseHandler } from 'utility/success-response';
import { PatientController } from './patient.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [PatientService, ResponseHandler],
  controllers: [PatientController],
})
export class PatientModule {}
