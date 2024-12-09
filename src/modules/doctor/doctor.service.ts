import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterDoctorDTO } from './DTO/register-doctor.dto';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Doctor, DoctorDocument } from './doctor.schema';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(Doctor.name) private doctorModel: Model<DoctorDocument>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}
  async register(register: RegisterDoctorDTO): Promise<any> {
    try {
      const existingDoctor = await this.doctorModel.findOne({
        email: register.email,
      });
      if (existingDoctor) {
        throw new CustomError('Email already registered', 409);
      }
      const newDoctor = new this.doctorModel({
        ...register,
      });
      await newDoctor.save();
      return newDoctor;
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
      const doctor = await this.doctorModel.findOne({ email: login.email });
      if (!doctor) {
        throw new CustomError('User not found', 404);
      }
      const isPasswordCorrect = await bcrypt.compare(
        login.password,
        doctor.password,
      );

      if (!isPasswordCorrect) {
        throw new CustomError('password didnt matched', 402);
      }

      const accessToken = await this.authService.generateAccessToken(doctor);
      const refreshToken = await this.authService.generateRefreshToken(doctor);
      doctor.refreshToken = refreshToken;
      await doctor.save();

      const newDoctor = doctor.toObject();
      const loggedInDoctor = this.authService.removeFields(newDoctor, [
        'password',
        'refreshToken',
      ]);

      return {
        doctor: loggedInDoctor,
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
}
