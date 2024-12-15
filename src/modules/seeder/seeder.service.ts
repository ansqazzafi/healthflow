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

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
  ) {}

  async seed() {
    // const patient = '675db34de7ee5e8bb8011051';
    // const appointment = '675db8bc9eb459b89fdc726d';
    // const objectId = new mongoose.Types.ObjectId(appointment);
    // await this.userModel.findByIdAndUpdate(
    //   patient,
    //   { $addToSet: { appointmentRecords: objectId } }, // Prevent duplicate entries
    //   { new: true }, // Return the updated document
    // );
    // this.logger.log("updated pat")
    // const result = await this.userModel.find();
    // result.forEach((user) => {
    //   console.log(user.appointmentRecords);
    // });

    // const appointment = await this.appointmentModel
    //   .findById('675edff4191710669b394be6')

    // console.log(appointment);

    const admin = await this.userModel.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('00000000', 10);
      await this.userModel.create({
        name: 'Ans Qazzafi',
        email: 'admin@gmail.com',
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

    //   const patientCareMember = await this.userModel.findOne({
    //     email: 'patientcare@gmail.com',
    //   });
    //   if (!patientCareMember) {
    //     const hashedPassword = await bcrypt.hash('11111111', 10);
    //     await  this.userModel.create({
    //       name: 'Ali Raza',
    //       email: 'patientcare@gmail.com',
    //       password: hashedPassword,
    //       phoneNumber: '0987654321',
    //       isActive: true,
    //       gender: gender.male,
    //       role: roles.patientCare,
    //       address: { country: 'Pakistan', city: 'Lahore' },
    //     });
    //     this.logger.log('Patient care user created successfully');
    //   } else {
    //     this.logger.log('Patient care user already exists');
    //     // }
    //   }
  }
}
