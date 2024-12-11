import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterHospitalDTO } from './DTO/register-hospital.dto';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './hospital.schema';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from 'DTO/register.dto';
import { DoctorService } from '../doctor/doctor.service';
import { RegisterDoctorDTO } from '../doctor/DTO/register-doctor.dto';
import { Specialty } from 'enums/specialty.enum';
import { gender } from 'enums/gender.enum';
import { AppointmentService } from '../appointment/appointment.service';
@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly doctorService: DoctorService,
    private readonly appointmentService: AppointmentService,
  ) {}
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

  public async getDoctorsByHospital(
    id: string,
    page: number,
    limit: number,
    specialty?: Specialty,
    city?: string,
    gender?: gender,
  ): Promise<any> {
    try {
      const doctors = await this.doctorService.getDoctorsByHospital(
        id,
        page,
        limit,
        specialty,
        city,
        gender,
      );
      if (!doctors) {
        throw new CustomError('Unable to get list of doctors', 401);
      }
      return doctors;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error fetching error', 402);
    }
  }

  public async getAppointments(hospitalId:string): Promise<any> {
    try {
      const appointments = await this.appointmentService.getAppointments(hospitalId);
      if (!appointments) {
        throw new CustomError('Unable to fetch appointments', 402);
      }
      return appointments;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'There is an error during fetching appointments',
        402,
      );
    }
  }
}
