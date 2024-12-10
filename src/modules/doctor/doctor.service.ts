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
}
