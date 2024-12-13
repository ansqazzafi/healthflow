import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Model } from 'mongoose';
import { CustomError } from 'utility/custom-error';
import { JwtService } from '@nestjs/jwt';
import { roles } from 'enums/role.enum';
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
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
    await user.save();
    return { message: `User account verified successfully!` };
  }

}


