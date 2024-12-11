import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ResponseHandler } from 'utility/success-response';
import { CustomError } from 'utility/custom-error';
import { TwilioService } from '../twilio/twilio.service';
import { DoctorService } from '../doctor/doctor.service';
import { HospitalService } from '../hospital/hospital.service';
import { LoginInDTO } from 'DTO/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Doctor, DoctorDocument } from '../doctor/doctor.schema';
import { Hospital, HospitalDocument } from '../hospital/hospital.schema';
import { Model } from 'mongoose';
import { roles } from 'enums/role.enum';
import { response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => DoctorService))
    private readonly doctorService: DoctorService,
    @Inject(forwardRef(() => HospitalService))
    private readonly hospitalService: HospitalService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
  ) { }

  public removeFields(obj: any, fields: string[]): any {
    const removedFields = { ...obj };
    fields.forEach((field) => delete removedFields[field]);
    return removedFields;
  }

  public async generateAccessToken(credentials): Promise<string> {
    const payload = {
      credentials,
    };
    const secretKey = process.env.ACCESS_KEY;
    const expiresIn = process.env.ACCESS_KEY_EXPIRE || '30s';
    return this.jwtService.signAsync(payload, { secret: secretKey, expiresIn });
  }

  public async generateRefreshToken(credentials): Promise<string> {
    const payload = { id: credentials._id, role: credentials.role };
    const secretKey = process.env.REFRESH_KEY;
    const expiresIn = process.env.REFRESH_KEY_EXPIRE || '30d';
    return this.jwtService.signAsync(payload, { secret: secretKey, expiresIn });
  }

  public async register(RegisterDto: any): Promise<boolean> {
    const { role, ...details } = RegisterDto;
    let response;
    switch (role) {
      case 'patient':
        response = await this.userService.register(details.patient);
        if (response) {
          return true;
        }
        throw new CustomError('Patient registration failed', 500);

      case 'hospital':
        response = await this.hospitalService.register(details.hospital);
        if (response) {
          return true;
        }
        throw new CustomError('Hospital registration failed', 500);
      default:
        throw new CustomError('Invalid Role', 401);
    }
  }

  public async login(LoginDto: LoginInDTO): Promise<any> {
    const { role, ...LoginDetails } = LoginDto;
    let response;
    switch (role) {
      case 'patient':
        response = await this.userService.login(LoginDetails);
        if (response) {
          return response;
        }
        throw new CustomError('Patient login failed', 500);
      case 'admin':
        response = await this.userService.login(LoginDetails);
        if (response) {
          return response;
        }
        throw new CustomError('Patient login failed', 500);
      case 'patientCare':
        response = await this.userService.login(LoginDetails);
        if (response) {
          return response;
        }
        throw new CustomError('Patient login failed', 500);

      case 'hospital':
        response = await this.hospitalService.login(LoginDetails);
        if (response) {
          return response;
        }
        throw new CustomError('Hospital login failed', 500);
      default:
        throw new CustomError('Invalid Role', 401);
    }
  }

  async logout(Id: string, role: string): Promise<any> {
    let entity;
    switch (role) {
      case 'patient':
        entity = await this.userModel.findById(Id);
        break;
      case 'patientCare':
        entity = await this.userModel.findById(Id);
        break;
      case 'admin':
        entity = await this.userModel.findById(Id);
        break;
      case 'hospital':
        entity = await this.hospitalModel.findById(Id);
        break;
      default:
        throw new CustomError('Invalid role', 401);
    }

    if (!entity) {
      throw new CustomError('Entity not found', 404);
    }
    await entity.updateOne({ $set: { refreshToken: 1 } });
    return { success: true, message: 'Logout successful, refreshToken invalidated' };
  }


  async refreshToken(oldRefreshToken: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(oldRefreshToken, { secret: process.env.REFRESH_KEY });
      console.log('Decoded Token:', decoded);
      const { id, role } = decoded;
      if (!id || !role) {
        throw new CustomError('Invalid refresh token - Missing ID or Role', 401);
      }
      let entity;
      switch (role) {
        case roles.patient:
        case roles.patientCare:
        case roles.admin:
          entity = await this.userModel.findById(id);
          console.log('User DB token:', entity?.refreshToken);
          if (!entity) {
            throw new CustomError('User not found', 404);
          }

          if (entity.refreshToken !== oldRefreshToken) {
            throw new CustomError('Invalid refresh token - Tokens do not match', 402);
          }
          break;
        case roles.hospital:
          entity = await this.hospitalModel.findById(id);
          console.log('Hospital DB token:', entity?.refreshToken);
          if (!entity) {
            throw new CustomError('Hospital not found', 404);
          }
          if (entity.refreshToken !== oldRefreshToken) {
            throw new CustomError('Invalid refresh token - Tokens do not match', 402);
          }
          break;

        default:
          throw new CustomError('Invalid role in refresh token', 400);
      }

      console.log("Heloo", entity)
      const newAccessToken = await this.generateAccessToken(entity);
      const newRefreshToken = await this.generateRefreshToken(entity);
      console.log("newTokens", newAccessToken, newRefreshToken)
      entity.refreshToken = newRefreshToken;
      await entity.save();
      console.log("saved refreshed");
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Error during refresh token:', error);
      throw new CustomError(error?.message || 'Failed to refresh token', 500);
    }
  }


  async verifyPhone(phoneNumber: string, role: string): Promise<any> {
    try {
      let entity;
      switch (role) {
        case roles.patient:
        case roles.patientCare:
        case roles.admin:
          entity = await this.userModel.findOne({ phoneNumber: phoneNumber });
          if (!entity) {
            throw new CustomError('User not found', 404);
          }
          break;
        case roles.hospital:
          entity = await this.hospitalModel.findOne({ phoneNumber: phoneNumber });
          if (!entity) {
            throw new CustomError('Hospital not found', 404);
          }
          break;
        default:
          throw new CustomError('Invalid role in refresh token', 400);
      }
      if (entity) {
        const message = "Your Verification Code for Forgot password are : "
        const verificationCode = await this.twilioService.sendVerificationSms(entity.phoneNumber, message)
        if (!verificationCode) {
          throw new CustomError("Unable to get Verifcation Code")
        }
        return verificationCode
      }

    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError("There is an Error during verify phone number", 402)
    }


  }

  async verifyCode(phoneNumber: string, verificationCode: string): Promise<any> {
    try {
      const isVerified = await this.twilioService.verifyCode(phoneNumber, verificationCode)
      if (!isVerified) {
        throw new CustomError("Unable to Verify the Code")
      }
      return isVerified
    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError("There is an error to verify the Code", 402)
    }
  }


  public async resetPassword(phoneNumber, newPassword, role): Promise<any> {
    try {
      console.log("Entered in update", newPassword);

      let entity;
      switch (role) {
        case roles.patient:
        case roles.patientCare:
        case roles.admin:
          entity = await this.userModel.findOneAndUpdate(
            { phoneNumber: phoneNumber },
            { password: newPassword },
            { new: true });
          if (!entity) {
            throw new CustomError('User not found', 404);
          }
          break;
        case roles.hospital:
          entity = await this.hospitalModel.findOneAndUpdate(
            { phoneNumber: phoneNumber },
            { password: newPassword },
            { new: true });
          if (!entity) {
            throw new CustomError('Hospital not found', 404);
          }
          break;
        default:
          throw new CustomError('Invalid role', 400);
      }

      return true

    } catch (error) {
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError("There is an error during reset the password")
    }
  }

}
