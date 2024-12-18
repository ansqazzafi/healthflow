import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { roles } from 'enums/role.enum';
import { User, UserDocument } from '../user/user.schema';
import { gender } from 'enums/gender.enum';
import {
  Appointment,
  AppointmentDocument,
} from '../appointment/appointment.schema';
import { NodemailerService } from 'src/modules/nodemailer/nodemailer.service';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    private readonly nodemailerService:NodemailerService
  ) {}

  async seed() {
    const admin = await this.userModel.findOne({ email: '0357bhabscsias20@gmail.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('00000000', 10);
      await this.userModel.create({
        name: 'Ans Qazzafi',
        email: '0357bhabscsias20@gmail.com',
        password: hashedPassword,
        phoneNumber: '1234567890',
        isActive: true,
        role: roles.admin,
        gender: gender.male,
        address: { country: 'Pakistan', city: 'Gujranwala' },
      });
      this.logger.log('Admin user created successfully');
    } else {
      this.logger.log('Admin user already exists');
    }


      const patientCareMember = await this.userModel.findOne({
        email: 'patientcare@gmail.com',
      });
      if (!patientCareMember) {
        const hashedPassword = await bcrypt.hash('11111111', 10);
        await  this.userModel.create({
          name: 'Ali Raza',
          email: 'patientcare@gmail.com',
          password: hashedPassword,
          phoneNumber: '0987654321',
          isActive: true,
          gender: gender.male,
          role: roles.patientCare,
          address: { country: 'Pakistan', city: 'Lahore' },
        });
        this.logger.log('Patient care user created successfully');
      } else {
        this.logger.log('Patient care user already exists');
        // }
      }
  }
}


