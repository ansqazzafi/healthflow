import { Injectable } from '@nestjs/common';
import { CustomError } from 'utility/custom-error';
import { TwilioService } from '../twilio/twilio.service';
import { LoginInDTO } from 'DTO/login.dto';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../user/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { roles } from 'enums/role.enum';
import * as bcrypt from 'bcrypt'
import { NodemailerService } from 'src/modules/nodemailer/nodemailer.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly jwtService: JwtService,
    private readonly nodemailerService: NodemailerService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
    try {
      const { role, ...details } = RegisterDto;
      console.log(RegisterDto, "DTO");

      if (role === roles.doctor) {
        throw new CustomError("Only hospital can register doctor")
      }
      console.log(details, "details");
      const roleData = details[role];
      const email = roleData.email;

      console.log(details[role], "Data");
      const user = await this.userModel.findOne({ email: email });
      if (user) {
        throw new CustomError(`${role} registration failed: email already exists`, 409);
      }

      const newUser = new this.userModel({
        ...roleData,
      });
      console.log("new User", newUser);
      await newUser.save();
      await this.nodemailerService.sendMail(newUser.email, "Confirmation", "Thanks for Registering in HealthFlow. Please wait for account verification.", newUser.name)
      console.log("saved");
      return true;

    } catch (error) {
      console.log(error, "error");
      throw new CustomError("There is an error", 500);
    }
  }



  public async login(LoginDto: LoginInDTO): Promise<any> {
    const { role, ...LoginDetails } = LoginDto;
    if (!LoginDetails.email || !LoginDetails.password) {
      throw new CustomError('Email and password are required', 400);
    }
    const user = await this.userModel.findOne({ email: LoginDetails.email });
    if (!user) {
      throw new CustomError(`${role} login failed`, 404);
    }
    if (user.isActive === false) {
      throw new CustomError(`Please wait for Account verification`, 404);
    }
    const isPasswordCorrect = await bcrypt.compare(LoginDetails.password, user.password);
    if (!isPasswordCorrect) {
      throw new CustomError('Password mismatch', 403);
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    const newUser = user.toObject();
    const loggedInUser = this.removeFields(newUser, ['password', 'refreshToken']);
    return {
      [`${role}`]: loggedInUser,
      accessToken,
      refreshToken,
    };
  }




  async logout(Id: string): Promise<any> {
    const user = await this.userModel.findById(Id);
    if (!user) {
      throw new CustomError('Entity not found', 404);
    }
    await user.updateOne({ $set: { refreshToken: 1 } });
    return {
      success: true,
      message: 'Logout successful, refreshToken invalidated',
    };
  }





  async refreshToken(oldRefreshToken: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: process.env.REFRESH_KEY,
      });
      console.log('Decoded Token:', decoded);
      const { id, role } = decoded;
      if (!id || !role) {
        throw new CustomError(
          'Invalid refresh token - Missing ID or Role',
          401,
        );
      }

      const user = await this.userModel.findById(id);
      console.log('User DB token:', user?.refreshToken);
      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (user.refreshToken !== oldRefreshToken) {
        throw new CustomError(
          'Invalid refresh token - Tokens do not match',
          402,
        );
      }
      const newAccessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);
      console.log('newTokens', newAccessToken, newRefreshToken);
      user.refreshToken = newRefreshToken;
      await user.save();
      console.log('saved refreshed');
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      console.error('Error during refresh token:', error);
      throw new CustomError(error?.message || 'Failed to refresh token', 500);
    }

  }


  async verifyPhone(phoneNumber: string): Promise<any> {
    try {
      const user = await this.userModel.findOne({ phoneNumber: phoneNumber });
      if (!user) {
        throw new CustomError('User not found', 404);
      }
      if (user) {
        const message = 'Your Verification Code for Forgot password are : ';
        const verificationCode = await this.twilioService.sendVerificationSms(
          user.phoneNumber,
          message,
        );
        if (!verificationCode) {
          throw new CustomError('Unable to get Verifcation Code');
        }
        return verificationCode;
      }
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'There is an Error during verify phone number',
        402,
      );
    }
  }



  async verifyCode(
    phoneNumber: string,
    verificationCode: string,
  ): Promise<any> {
    try {
      const isVerified = await this.twilioService.verifyCode(
        phoneNumber,
        verificationCode,
      );
      if (!isVerified) {
        throw new CustomError('Unable to Verify the Code');
      }
      return isVerified;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error to verify the Code', 402);
    }
  }

  public async resetPassword(phoneNumber, newPassword): Promise<any> {
    try {
      console.log('Entered in update', newPassword);
      const user = await this.userModel.findOneAndUpdate(
        { phoneNumber: phoneNumber },
        { password: newPassword },
        { new: true },
      );
      if (!user) {
        throw new CustomError('User not found', 404);
      }
      return true;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error during reset the password');
    }
  }
}