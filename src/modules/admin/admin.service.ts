import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from '../hospital/hospital.schema';
import { CustomError } from 'utility/custom-error';
import { JwtService } from '@nestjs/jwt';
import { roles } from 'enums/role.enum';
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    private readonly jwtService: JwtService,
  ) {}

  public async verifyAccount(Id: string, role: string): Promise<any> {
    let entity;
    switch (role) {
      case 'patient':
        entity = await this.userModel.findById(Id);
        break;
      case 'hospital':
        entity = await this.hospitalModel.findById(Id);
        break;
      default:
        throw new CustomError('Invalid account type', 400);
    }

    if (!entity) {
      throw new CustomError('Entity not found', 404);
    }

    if (entity.isActive) {
      throw new CustomError('This account is already verified', 400);
    }
    entity.isActive = true;
    await entity.save();
    return { message: `${role} account verified successfully!` };
  }
}
