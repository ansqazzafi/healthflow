import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterHospitalDTO } from './DTO/register-hospital.dto';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './hospital.schema';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class HospitalService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
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
}
