import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { Model } from 'mongoose';
import { CustomError } from 'utility/custom-error';
@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  public async getAppointments(hospitalId: string): Promise<any> {
    try {
      const appointments = await this.appointmentModel.find({
        hospital: hospitalId,
      }).populate('doctor', '-password -refreshToken').populate('patient', '-password -refreshToken')
      if (appointments.length === 0) {
        throw new CustomError('No appointments found for this hospital', 404);
      }
      return appointments;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'An error occurred while fetching appointments',
        500,
      );
    }
  }
}
