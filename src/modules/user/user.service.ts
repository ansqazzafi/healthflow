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
import * as bcrypt from 'bcrypt'
@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @Inject(forwardRef(() => TwilioService)) private readonly twilioService: TwilioService,
    ) { }

    public async register(register: RegisterUserDTO, role:string): Promise<any> {
        try {
            const response = await this.globalAuth.register(register , role)
            if(!response){
                throw new CustomError("Error During Login" , 402)
            }
            return response
          
        } catch (error) {
            console.error(error);
            if (error instanceof CustomError) {
                throw error
            }
            throw new CustomError('Error during user registration', 500);
        }
    }

    public async login(login: LoginInUserDTO , role:string): Promise<any> {
        try {
            const response = await this.globalAuth.login(login , role)
            if(!response){
                throw new CustomError("Error During Login" , 402)
            }
            return response
        } catch (error) {
            console.error(error);
            if (error instanceof CustomError) {
                throw error
            }
            throw new CustomError('Error during user registration', 500);
        }
    }


}
