import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterHospitalDTO } from './DTO/register-hospital.dto';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './hospital.schema';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';
import { DoctorService } from '../doctor/doctor.service';
import { RegisterDoctorDTO } from '../doctor/DTO/register-doctor.dto';
import { AppointmentService } from '../appointment/appointment.service';
import { throws } from 'assert';
import { User, UserDocument } from '../user/user.schema';
import { Doctor, DoctorDocument } from '../doctor/doctor.schema';
import { Appointment, AppointmentDocument } from '../appointment/appointment.schema';
import { UserService } from '../user/user.service';
@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly doctorService: DoctorService,
  ) { }
  async register(register: RegisterHospitalDTO): Promise<any> {
    try {
      const existingHospital = await this.hospitalModel.findOne({
        email: register.email,
      });
      if (existingHospital) {
        throw new CustomError('Email already registered', 409);
      }
      const newHospital = new this.hospitalModel({
        ...register,
      });
      await newHospital.save();
      return newHospital;
    } catch (error) {
      console.error(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Error during user registration', 500);
    }
  }

  public async login(login: any) {
    try {
      const hospital = await this.hospitalModel.findOne({ email: login.email });
      if (!hospital) {
        throw new CustomError('User not found', 404);
      }
      const isPasswordCorrect = await bcrypt.compare(
        login.password,
        hospital.password,
      );

      if (!isPasswordCorrect) {
        throw new CustomError('password didnt matched', 402);
      }

      const accessToken = await this.authService.generateAccessToken(hospital);
      const refreshToken =
        await this.authService.generateRefreshToken(hospital);
      hospital.refreshToken = refreshToken;
      await hospital.save();

      const newHospital = hospital.toObject();
      const loggedInHospital = this.authService.removeFields(newHospital, [
        'password',
        'refreshToken',
      ]);

      return {
        hospital: loggedInHospital,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('Error during user login', 500);
    }
  }

  public async registerDoctor(
    RegisterDto: RegisterDoctorDTO,
    id: string,
  ): Promise<any> {
    try {
      const registeredDoctor = await this.doctorService.register(
        RegisterDto,
        id,
      );
      if (!registeredDoctor) {
        throw new CustomError('Unable to Registered the Doctor', 401);
      }
      console.log('registeredDoctor', registeredDoctor);

      return registeredDoctor;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error during register doctor', 402);
    }
  }

  public async getHospitals(page: number, limit: number, city?: string): Promise<any> {
    try {
      const skip = (page - 1) * limit;

      const aggregation = await this.hospitalModel.aggregate([
        {
          $match: {
            ...(city && { 'address.city': city }),
          }
        },
        {
          $facet: {
            hospitals: [
              { $skip: skip },
              { $limit: limit },
            ],
            totalCount: [
              { $count: 'count' }
            ]
          }
        }
      ]);
      if (aggregation[0].hospitals.length === 0) {
        throw new CustomError("No hospital Found", 404)
      }
      const result = {
        hospitals: aggregation[0]?.hospitals || [],
        totalCount: aggregation[0]?.totalCount[0]?.count || 0,
      };

      return result;

    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError("There is an error during fetching Hospitals", 500)
    }
  }

  public async deleteHospital(id: string): Promise<any> {
    const session = await this.hospitalModel.db.startSession();
    try {
      session.startTransaction();
      const hospital = await this.hospitalModel.findByIdAndDelete({ _id: id }, { session });
      console.log(hospital, "Hospital---");
      if (!hospital) {
        throw new CustomError("No Hospital found with given id", 404);
      }

      const deletedDoctors = await this.doctorModel.deleteMany({ hospital: id }, { session });
      console.log(deletedDoctors, "Doctor---");
      if (deletedDoctors.deletedCount === 0) {
        throw new CustomError("No doctors found to delete for the given hospital", 404);
      }
      const deletedAppointments = await this.appointmentModel.aggregate([
        { $match: { hospital: id } },
        { $project: { _id: 1 } },
      ]);
      console.log(deletedAppointments, "Appointments---");
      if (deletedAppointments.length === 0) {
        throw new CustomError("No appointments found to delete for the given hospital", 404);
      }
      const deletedAppointmentsIds = deletedAppointments.map(appointment => appointment._id);
      const result = await this.userModel.updateMany(
        {},
        {
          $pull: {
            appointmentRecords: { $in: deletedAppointmentsIds }
          }
        }
      )
      if (result.modifiedCount === 0) {
        throw new CustomError("Cannot update the appointment records", 500);
      }
      await session.commitTransaction();
      return true;
    } catch (error) {
      console.log("Error:", error);
      await session.abortTransaction();
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError("There is an error during the deletion of the hospital", 500);
    } finally {
      session.endSession();
    }
  }


}
