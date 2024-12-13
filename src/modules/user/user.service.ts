import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDTO } from './DTO/register-user.dto';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import { CustomError } from 'utility/custom-error';
import { TwilioService } from '../twilio/twilio.service';
import { AuthService } from '../auth/auth.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
  ) { }
}
