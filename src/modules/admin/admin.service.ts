import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Model } from 'mongoose';
import { CustomError } from 'utility/custom-error';
import { JwtService } from '@nestjs/jwt';
import { roles } from 'enums/role.enum';
import { UpdateAdminDTO } from './DTO/updatedto copy';
import { TwilioService } from '../twilio/twilio.service';
import { NodemailerService } from 'src/modules/nodemailer/nodemailer.service';
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly twilioService: TwilioService,
    private readonly nodemailerService: NodemailerService,
  ) { }

  public async verifyAccount(Id: string): Promise<any> {
    const user = await this.userModel.findById(Id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (user.isActive) {
      throw new CustomError('This account is already verified', 400);
    }
    user.isActive = true;
    const updateUser = await user.save();
    await this.nodemailerService.sendMail(user.email, "Account Activated", `Congragulation Your Account corresponding ${user.email} at HealthFlow are Activated Successfully, Now you can login your account`, user.name)
    if(updateUser.isActive !== true){
      throw new CustomError("Unable to verify account")
    }
    return { message: `User account verified successfully!` };
  }

  public async updateProfile(id, updateDto: UpdateAdminDTO): Promise<any> {
    try {
      console.log(updateDto, 'ffff');
      const updatedPatient = await this.userModel
        .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
        .select(
          '-password -refreshToken -doctors -departments -availableDays -availableHours -degree',
        );

      if (!updatedPatient) {
        throw new CustomError('Admin not found', 404);
      }

      return updatedPatient;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There was an error updating the Profile', 500);
    }
  }
}
