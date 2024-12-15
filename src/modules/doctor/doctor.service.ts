import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterDoctorDTO } from './DTO/register-doctor.dto';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { TwilioService } from '../twilio/twilio.service';
import { Specialty } from 'enums/specialty.enum';
import { gender } from 'enums/gender.enum';
import { log } from 'node:console';
import { UpdateDoctorDTO } from './DTO/update-doctor.dto';
import { UserDocument, User } from '../user/user.schema';

import { RegisterDto } from 'DTO/register.dto';
import { Types } from 'twilio/lib/rest/content/v1/content';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly twilioService: TwilioService,
  ) {}
  public async register(
    register: RegisterDto,
    HospitalId: string,
  ): Promise<any> {
    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      const { role, ...details } = register;
      if (!details.doctor) {
        throw new CustomError(
          'Role-specific data is missing for the registration process',
          400,
        );
      }
      const DoctorData = details.doctor;

      const existingDoctor = await this.userModel
        .findOne({
          $or: [{ email: DoctorData.email }, { degreeId: DoctorData.degreeId }],
        })
        .session(session);

      if (existingDoctor) {
        throw new CustomError(
          `${role} registration failed: email or degreeId already exists`,
          409,
        );
      }

      const newDoctor = new this.userModel({
        ...DoctorData,
      });

      const savedDoctor = await newDoctor.save({ session });
      console.log(savedDoctor._id);

      const hospital = await this.userModel.findByIdAndUpdate(HospitalId, {
        $push: { doctors: savedDoctor._id },
      });
      // if (!hospital.doctors.includes(savedDoctor._id)) {
      //   throw new CustomError("Hospital couldn't add doctor", 401);
      // }
      await session.commitTransaction();
      session.endSession();

      return newDoctor;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error('Error during doctor registration:', error);

      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError('Error during user registration', 500);
    }
  }

  public async findDoctors(
    page: number,
    limit: number,
    city: string,
    specialty?: string,
    hospitalId?: string,
    avaliablity?: string,
    name?:string
  ): Promise<any> {
    try {
      const avaliablityArray = [];
      avaliablityArray.push(avaliablity);
      console.log(avaliablityArray, 'arrray');

      const skip = (page - 1) * limit;
      const aggregation = await this.userModel.aggregate([
        {
          $match: {
            role: 'doctor',
            ...(name && { name: { $regex: name, $options: 'i' } }),
            ...(city && { 'address.city': city }),
            ...(specialty && { specialty: specialty }),
            ...(hospitalId && { hospital: hospitalId }),
            ...(avaliablity && { availableDays: { $in: avaliablityArray } }),
          },
        },
        {
          $facet: {
            doctors: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ]);
      if (aggregation[0].doctors.length === 0) {
        throw new CustomError('No Doctor Found', 404);
      }
      const result = {
        doctors: aggregation[0]?.doctors || [],
        totalCount: aggregation[0]?.totalCount[0]?.count || 0,
      };
      return result;
    } catch (error) {
      console.log(error, 'err');

      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error during fetching Doctors', 500);
    }
  }

  public async findOne(id: string): Promise<any> {
    try {
      const doctor = await this.userModel
        .findOne({ _id: id })
        .select('-password -refreshToken -doctors -departments -queries');
      if (!doctor) {
        throw new CustomError('Doctor not found', 404);
      }
      return doctor;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('there is an error to find doctor', 500);
    }
  }

  public async updateDoctorProfile(
    id: string,
    updateDto: UpdateDoctorDTO,
  ): Promise<any> {
    try {
      console.log(updateDto, 'ffff');
      const updatedDoctor = await this.userModel.findByIdAndUpdate(
        id,
        { $set: updateDto },
        { new: true },
      ).select(
        '-degree -password -refreshToken -doctors -departments',
      );;

      if (!updatedDoctor) {
        throw new CustomError('Doctor not found', 404);
      }

      return updatedDoctor;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'There was an error updating the Doctor Profile',
        500,
      );
    }
  }
}
