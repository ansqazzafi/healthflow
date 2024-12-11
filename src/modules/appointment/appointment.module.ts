import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Appointment, AppointmentSchema } from './appointment.schema';
import { AppointmentService } from './appointment.service';
import { ResponseHandler } from 'utility/success-response';
MongooseModule;
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [],
  providers: [AppointmentService, ResponseHandler],
  exports:[AppointmentService]
})

export class AppointmentModule {}
