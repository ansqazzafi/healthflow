import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Model } from 'mongoose';
import { CustomError } from 'utility/custom-error';
import { UpdatePatientDTO } from './DTO/updateDto';
@Injectable()
export class PatientService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async findPatients(
    page: number,
    limit: number,
    city: string,
    name: string,
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const aggregation = await this.userModel.aggregate([
        {
          $match: {
            role: 'patient',
            ...(name && { name: { $regex: name, $options: 'i' } }),
            ...(city && { 'address.city': city }),
          },
        },
        {
          $facet: {
            patients: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ]);
      if (aggregation[0].patients.length === 0) {
        throw new CustomError('No Patient Found', 404);
      }
      const result = {
        patients: aggregation[0]?.patients || [],
        totalCount: aggregation[0]?.totalCount[0]?.count || 0,
      };
      return result;
    } catch (error) {
      console.log(error, 'err');

      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error during fetching Patients', 500);
    }
  }

  public async findOne(id): Promise<any> {
    try {
      const patient = await this.userModel
        .findOne({ _id: id })
        .select(
          '-password -refreshToken -doctors -departments -availableDays -availableHours -degree',
        );
      if (!patient) {
        throw new CustomError('patient not found', 404);
      }
      return patient;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('there is an error to find patient', 500);
    }
  }

  public async updateProfile(id, updateDto: UpdatePatientDTO): Promise<any> {
    try {
      console.log(updateDto, 'ffff');
      const updatedPatient = await this.userModel
        .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
        .select(
          '-password -refreshToken -doctors -departments -availableDays -availableHours -degree',
        );

      if (!updatedPatient) {
        throw new CustomError('Patient not found', 404);
      }

      return updatedPatient;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There was an error updating the Profile', 500);
    }
  }
}
