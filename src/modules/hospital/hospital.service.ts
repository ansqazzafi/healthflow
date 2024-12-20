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
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  public async getHospitals(
    page: number,
    limit: number,
    city?: string,
    name?: string,
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const aggregation = await this.userModel.aggregate([
        {
          $match: {
            role: 'hospital',
            ...(name && { name: { $regex: name, $options: 'i' } }),
            ...(city && { 'address.city': city }),
          },
        },
        {
          $lookup:{
            from:"users",
            localField:'doctors',
            foreignField:'_id',
            as:'doctorsEnrolled'
          }
        },
        {
          $project: {
            password: 0,
            refreshToken: 0,
            createdAt:0,
            updatedAt:0,
            __v:0,
            doctors:0,
            doctorsEnrolled:{
              password:0,
              refreshToken:0,
              createdAt:0,
              updatedAt:0,
              appointmentRecords:0,
              profilePicture:0,
              isPhoneVerified:0,
              __v:0
            }
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

  public async updateProfile(
    id: string,
    updateDto: UpdateHospitalDTO,
  ): Promise<any> {
    try {
      console.log(updateDto, 'ffff');

      const updatedHospital = await this.userModel
        .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
        .select(
          '-availableDays -availableHours -degree -queries -password -refreshToken',
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
      const hospital = await this.userModel
        .findOne({ _id: id })
        .select(
          '-availableDays -availableHours -degree -queries -password -refreshToken',
        );
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

  public async deleteHospital(id: string): Promise<boolean> {
    const session = await this.userModel.db.startSession();
    try {
      session.startTransaction();

      const hospital = await this.userModel.findOneAndDelete(
        { _id: id },
        { session },
      );
      if (!hospital) {
        throw new CustomError('No hospital found with the given ID', 404);
      }

      const { deletedCount: deletedDoctorsCount } =
        await this.userModel.deleteMany({ hospital: id }, { session });
      if (deletedDoctorsCount === 0) {
       throw new CustomError('No doctors associated with the hospital',401);
      }

      const appointmentsToDelete = await this.appointmentModel
        .find({ hospital: id }, { _id: 1 })
        .session(session);
      const deletedAppointmentsIds = appointmentsToDelete.map((app) =>
        app._id.toString(),
      );
      console.log(deletedAppointmentsIds[0], 'idd');

      if (deletedAppointmentsIds.length > 0) {
       const deletedAppointmentCount=  await this.appointmentModel.deleteMany(
          { hospital: id },
          { session },
        );
        if(deletedAppointmentCount.deletedCount === 0){
          throw new CustomError('No Appointment to deleted',401);
        }

        const result = await this.userModel.updateMany(
          { appointmentRecords: { $in: deletedAppointmentsIds } },
          { $pull: { appointmentRecords: { $in: deletedAppointmentsIds } } },
          { session },
        );
        console.log(result.modifiedCount, 'modifiedCOunt');

        if (result.modifiedCount === 0) {
          throw new CustomError(
            'No users updated for deleted appointments',
            404,
          );
        }
      } else {
        console.log('No appointments found to delete');
      }

      await session.commitTransaction();
      return true;
    } catch (error) {
      console.error('Error:', error);
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
}
