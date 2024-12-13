import { Injectable } from '@nestjs/common';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';

import {
  Appointment,
  AppointmentDocument,
} from '../appointment/appointment.schema';
import { UserService } from '../user/user.service';
import { UpdateHospitalDTO } from './DTO/update-hospital.dto';
@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>
  ) { }


  public async getHospitals(
    page: number,
    limit: number,
    city?: string,
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const aggregation = await this.userModel.aggregate([
        {
          $match: {
            ...(city && { 'address.city': city }),
          },
        },
        {
          $facet: {
            hospitals: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ]);
      if (aggregation[0].hospitals.length === 0) {
        throw new CustomError('No hospital Found', 404);
      }
      const result = {
        hospitals: aggregation[0]?.hospitals || [],
        totalCount: aggregation[0]?.totalCount[0]?.count || 0,
      };

      return result;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error during fetching Hospitals', 500);
    }
  }

  public async deleteHospital(id: string): Promise<any> {
    const session = await this.userModel.db.startSession();
    try {
      session.startTransaction();
      const hospital = await this.userModel.findByIdAndDelete(id, {
        session,
      });
      console.log(hospital, 'Hospital---');
      if (!hospital) {
        throw new CustomError('No hospital found with the given ID', 404);
      }

      const deletedDoctors = await this.userModel.deleteMany(
        { hospital: id },
        { session },
      );
      console.log(deletedDoctors, 'Doctors---');
      if (deletedDoctors.deletedCount === 0) {
        console.log('No doctors associated with the hospital');
      }

      const appointmentsToDelete = await this.appointmentModel.find({
        hospital: id,
      });
      console.log(appointmentsToDelete, 'Appointments---');
      if (appointmentsToDelete.length > 0) {
        const deletedAppointmentsIds = appointmentsToDelete.map(
          (appointment) => appointment._id,
        );
        const deletedAppointments = await this.appointmentModel.deleteMany(
          { hospital: id },
          { session },
        );
        console.log(deletedAppointmentsIds, 'Deleted Appointments---');

        const result = await this.userModel.updateMany(
          {
            appointmentRecords: { $in: deletedAppointmentsIds },
          },
          {
            $pull: {
              appointmentRecords: { $in: deletedAppointmentsIds },
            },
          },
          { session },
        );

        if (result.modifiedCount === 0) {
          console.log('No users updated for deleted appointments');
        }
      } else {
        console.log('No appointments found to delete');
      }

      await session.commitTransaction();
      return true;
    } catch (error) {
      console.log('Error:', error);
      await session.abortTransaction();
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'There was an error during the deletion of the hospital',
        500,
      );
    } finally {
      session.endSession();
    }
  }
  public async updateProfile(
    id: string,
    updateDto: UpdateHospitalDTO,
  ): Promise<any> {
    try {
      console.log(updateDto, 'ffff');

      const updatedHospital = await this.userModel.findByIdAndUpdate(
        id,
        { $set: updateDto },
        { new: true },
      );

      if (!updatedHospital) {
        throw new CustomError('Hospital not found', 404);
      }

      return updatedHospital;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There was an error updating the hospital', 500);
    }
  }
  public async findOne(id: string): Promise<any> {
    try {
      const hospital = await this.userModel.findOne({ _id: id });
      if (!hospital) {
        throw new CustomError('Hospital not found', 404);
      }
      return hospital;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('there is an error to find hospital', 500);
    }
  }
}
