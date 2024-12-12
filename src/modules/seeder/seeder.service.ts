import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { roles } from 'enums/role.enum';
import { User, UserDocument } from '../user/user.schema';
import { gender } from 'enums/gender.enum';
import { Doctor, DoctorDocument } from '../doctor/doctor.schema';
import { Hospital, HospitalDocument } from '../hospital/hospital.schema';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Doctor.name) private docModel: Model<DoctorDocument>,
    @InjectModel(Hospital.name) private host: Model<HospitalDocument>,
  ) { }

  async seed() {

    // const appointid = '675abe164024f06ff6d87518'
    // const userid = '675abc24e51d8739f1075a28'
    // await this.userModel.findByIdAndUpdate(
    //   { _id: userid },
    //   { $push: { appointmentRecords: appointid } }
    // );


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

    const patientCareMember = await this.userModel.findOne({
      email: 'patientcare@gmail.com',
    });
    if (!patientCareMember) {
      const hashedPassword = await bcrypt.hash('11111111', 10);
      await this.userModel.create({
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
    }
  }
}
