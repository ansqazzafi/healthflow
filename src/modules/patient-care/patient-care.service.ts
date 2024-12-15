import { Injectable } from '@nestjs/common';
import { CustomError } from 'utility/custom-error';
import { UpdatePatientCareDTO } from './DTO/updatedto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/user.schema';
import { roles } from 'enums/role.enum';

@Injectable()
export class PatientCareService {
     constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
    
      public async findPatientCareStaff(
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
                role: roles.patientCare,
                ...(name && { name: { $regex: name, $options: 'i' } }),
                ...(city && { 'address.city': city }),
              },
            },
            {
              $facet: {
                patientCareStaff: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: 'count' }],
              },
            },
          ]);
          if (aggregation[0].patientCareStaff.length === 0) {
            throw new CustomError('No Staff Found', 404);
          }
          const result = {
            patientCareStaff: aggregation[0]?.patientCareStaff || [],
            totalCount: aggregation[0]?.totalCount[0]?.count || 0,
          };
          return result;
        } catch (error) {
          console.log(error, 'err');
    
          if (error instanceof CustomError) {
            throw error;
          }
          throw new CustomError('There is an error during fetching Staff', 500);
        }
      }
    
      public async findOne(id): Promise<any> {
        try {
          const patient = await this.userModel
            .findOne({ _id: id })
            .select('-password -refreshToken -doctors -departments -availableDays -availableHours -degree');
          if (!patient) {
            throw new CustomError('Staff not found', 404);
          }
          return patient;
        } catch (error) {
          if (error instanceof CustomError) {
            throw error;
          }
          throw new CustomError('there is an error to find Staff', 500);
        }
      }
    
      public async updateProfile(id, updateDto:UpdatePatientCareDTO):Promise<any>{
        try {
          console.log(updateDto, 'ffff');
          const updatedPatient = await this.userModel.findByIdAndUpdate(
            id,
            { $set: updateDto },
            { new: true },
          ).select('-password -refreshToken -doctors -departments -availableDays -availableHours -degree');
    
          if (!updatedPatient) {
            throw new CustomError('staff not found', 404);
          }
    
          return updatedPatient;
        } catch (error) {
          if (error instanceof CustomError) {
            throw error;
          }
          throw new CustomError(
            'There was an error updating the Profile',
            500,
          );
        }
      }
    
}
