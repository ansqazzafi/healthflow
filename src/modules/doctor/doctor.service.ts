import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterDoctorDTO } from './DTO/register-doctor.dto';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from './doctor.schema';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { Hospital, HospitalDocument } from '../hospital/hospital.schema';
import { TwilioService } from '../twilio/twilio.service';
import { Specialty } from 'enums/specialty.enum';
import { gender } from 'enums/gender.enum';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    private readonly twilioService: TwilioService
  ) { }
  public async register(register: RegisterDoctorDTO, HospitalId: string): Promise<any> {
    console.log("Registered IN D", register);
    const { degreeId } = register
    const session = await this.doctorModel.db.startSession();
    session.startTransaction();
    try {
      const existingDoctorWithDegree = await this.doctorModel.findOne({
        degreeId: degreeId,
      });

      if (existingDoctorWithDegree) {
        throw new CustomError('A doctor with the same degreeId is already registered with hospital', 409);
      }

      const newDoctor = new this.doctorModel({
        ...register,
        hospital: HospitalId,
      });
      await newDoctor.save({ session });
      const hospitalUpdateResult = await this.hospitalModel.findByIdAndUpdate(
        HospitalId,
        { $push: { doctors: newDoctor._id } },
        { session, new: true }
      );
      console.log("update hospital", hospitalUpdateResult)

      if (!hospitalUpdateResult) {
        throw new CustomError('Hospital not found', 404);
      }
      await session.commitTransaction();
      session.endSession();

      return newDoctor;
    } catch (error) {
      console.error(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Error during user registration', 500);
    }
  }

  public async getDoctorsByHospital(
    id: string,
    page: number,
    limit: number,
    specialty?: Specialty,
    city?: string,
    gender?: gender
  ): Promise<any> {
    console.log(id, page, limit, specialty, "cred")
    console.log(typeof (page), typeof (limit))
    try {
      const skip = (page - 1) * limit;
      const aggregation = await this.doctorModel.aggregate([
        {
          $match: {
            hospital: id,
            ...(specialty && { specialty: specialty.toUpperCase() }),
            ...(city && { 'address.city': city }),
            ...(gender && { gender: gender.toLowerCase() }),
          },
        },
        {
          $facet: {
            doctors: [{ $skip: (page - 1) * limit }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ]);

      console.log(`Pagination: skip = ${skip}, limit = ${limit}`);

      const doctors = aggregation[0]?.doctors || [];
      const totalCount = aggregation[0]?.totalCount[0]?.count || 0;
      if (doctors.length === 0) {
        throw new CustomError("No Doctor found", 404)
      }

      return { doctors, totalCount };
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      console.log(error, "hjjj");

      throw new CustomError('There is an error during fetching doctors', 402);
    }
  }

}
