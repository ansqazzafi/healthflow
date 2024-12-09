import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDTO } from './DTO/register-user.dto';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CustomError } from 'utility/custom-error';
import { TwilioService } from '../twilio/twilio.service';
import { LoginInUserDTO } from './DTO/login-user.dto';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => TwilioService))
    private readonly twilioService: TwilioService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  public async register(register: RegisterUserDTO): Promise<any> {
    try {
      const existingUser = await this.userModel.findOne({
        email: register.email,
      });
      if (existingUser) {
        throw new CustomError('Email already registered', 409);
      }
      const newUser = new this.userModel({
        ...register,
      });
      await newUser.save();
      return newUser;
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
      const user = await this.userModel.findOne({ email: login.email });
      if (!user) {
        throw new CustomError('User not found', 404);
      }
      const isPasswordCorrect = await bcrypt.compare(
        login.password,
        user.password,
      );

      if (!isPasswordCorrect) {
        throw new CustomError('password didnt matched', 402);
      }

      const accessToken = await this.authService.generateAccessToken(user);
      const refreshToken = await this.authService.generateRefreshToken(user);
      user.refreshToken = refreshToken;
      await user.save();

      const newUser = user.toObject();
      const loggedInUser = this.authService.removeFields(newUser, [
        'password',
        'refreshToken',
      ]);

      return {
        user: loggedInUser,
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
