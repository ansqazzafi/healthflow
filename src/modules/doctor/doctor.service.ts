import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { RegisterDoctorDTO } from './DTO/register-doctor.dto';
import { CustomError } from 'utility/custom-error';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { TwilioService } from '../twilio/twilio.service';
import { Specialty } from 'enums/specialty.enum';
import { gender } from 'enums/gender.enum';
import { log } from 'node:console';
import { UpdateDoctorDTO } from './DTO/update-doctor.dto';
import { UserDocument, User } from '../user/user.schema';
import { deletedDoctorMessage } from 'utility/deleted-doctor-message'
import { RegisterDto } from 'DTO/register.dto';
import { Types } from 'twilio/lib/rest/content/v1/content';
import { Appointment, AppointmentDocument } from '../appointment/appointment.schema';
import { NodemailerModule } from 'src/modules/nodemailer/nodemailer.module';
import { NodemailerService } from 'src/modules/nodemailer/nodemailer.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private readonly twilioService: TwilioService,
    private readonly nodemailerService: NodemailerService,
  ) { }
  public async register(
    register: RegisterDto,
    HospitalId: string,
  ): Promise<any> {
    const session = await this.userModel.db.startSession();
    session.startTransaction();
    try {
      const { password } = register.doctor
      const { role, ...details } = register;
      register.doctor.password = await bcrypt.hash(password, 10);
      if (!details.doctor) {
        throw new CustomError(
          'Role-specific data is missing for the registration process',
          400,
        );
      }
      const DoctorData = details.doctor;

      const existingDoctor = await this.userModel
        .findOne({
          $or: [{ email: DoctorData.email }, { degreeId: DoctorData.degreeId }],
        })
        .session(session);

      if (existingDoctor) {
        throw new CustomError(
          `${role} registration failed: email or degreeId already exists`,
          409,
        );
      }

      const newDoctor = new this.userModel({
        ...DoctorData,
      });

      const savedDoctor = await newDoctor.save({ session });
      console.log(savedDoctor._id);

      const hospital = await this.userModel.findByIdAndUpdate(HospitalId, {
        $push: { doctors: savedDoctor._id },
      });
      await this.nodemailerService.sendMail(savedDoctor.email, 'Congrates', `Congragulation ${hospital.name} are hired you. We hope this will be pleasure for you.Your temporary accounts details are:
        email:${savedDoctor.email}
        password:${password} `, savedDoctor.name)
      await session.commitTransaction();
      session.endSession();

      return newDoctor;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error('Error during doctor registration:', error);

      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError('Error during user registration', 500);
    }
  }

  public async findDoctors(
    page: number,
    limit: number,
    city: string,
    specialty?: string,
    hospitalId?: string,
    avaliablity?: string,
    name?: string
  ): Promise<any> {
    try {
      const avaliablityArray = [];
      avaliablityArray.push(avaliablity);
      console.log(avaliablityArray, 'arrray');

      const skip = (page - 1) * limit;
      const aggregation = await this.userModel.aggregate([
        {
          $match: {
            role: 'doctor',
            ...(name && { name: { $regex: name, $options: 'i' } }),
            ...(city && { 'address.city': city }),
            ...(specialty && { specialty: specialty }),
            ...(hospitalId && { hospital: hospitalId }),
            ...(avaliablity && { availableDays: { $in: avaliablityArray } }),
          },
        },
        {
          $facet: {
            doctors: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ]);
      if (aggregation[0].doctors.length === 0) {
        throw new CustomError('No Doctor Found', 404);
      }
      const result = {
        doctors: aggregation[0]?.doctors || [],
        totalCount: aggregation[0]?.totalCount[0]?.count || 0,
      };
      return result;
    } catch (error) {
      console.log(error, 'err');

      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error during fetching Doctors', 500);
    }
  }

  public async findOne(id: string): Promise<any> {
    try {
      const doctor = await this.userModel
        .findOne({ _id: id })
        .select('-password -refreshToken -doctors -departments -queries');
      if (!doctor) {
        throw new CustomError('Doctor not found', 404);
      }
      return doctor;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('there is an error to find doctor', 500);
    }
  }

  public async updateDoctorProfile(
    id: string,
    updateDto: UpdateDoctorDTO,
  ): Promise<any> {
    try {
      console.log(updateDto, 'ffff');
      const updatedDoctor = await this.userModel.findByIdAndUpdate(
        id,
        { $set: updateDto },
        { new: true },
      ).select(
        '-degree -password -refreshToken -doctors -departments',
      );;

      if (!updatedDoctor) {
        throw new CustomError('Doctor not found', 404);
      }

      return updatedDoctor;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'There was an error updating the Doctor Profile',
        500,
      );
    }
  }

  public async deleteDoctor(hospitalId: string, doctorId: string): Promise<any> {
    const session = await this.userModel.db.startSession();

    try {
      session.startTransaction();
      const deletedDoctor = await this.userModel.findByIdAndDelete(doctorId).session(session);
      if (!deletedDoctor) {
        throw new CustomError("Doctor does not exist", 404);
      }

      const hospital = deletedDoctor.hospital;
      console.log(hospital, "compare", hospitalId)
      if (hospital.toString() !== hospitalId) {
        throw new Error("The provided hospital ID does not match the record");
      }

      const deletedDoctorFromHospital = await this.userModel.findByIdAndUpdate(
        hospitalId,
        { $pull: { doctors: deletedDoctor._id } },
        { session }
      );
      if (!deletedDoctorFromHospital) {
        throw new CustomError("Unable to remove doctor from hospital", 500);
      }
      const appointmentsToDelete = await this.appointmentModel.find({ doctor: new mongoose.Types.ObjectId(doctorId) });
      if (appointmentsToDelete.length > 0) {
        const appointmentIdsToDelete = appointmentsToDelete.map(appointment => appointment._id);
        const patientIds = appointmentsToDelete.map(appointment => appointment.patient);
        const patients = await this.userModel.find({ _id: { $in: patientIds } });
        const patientNameAndEmail = patients.map(patient => ({
          name: patient.name,
          email: patient.email
        }));
        console.log(patientNameAndEmail, "number")
        const deletedAppointments = await this.appointmentModel.deleteMany(
          { _id: { $in: appointmentIdsToDelete } },
          { session }
        );
        if (deletedAppointments.deletedCount === 0) {
          throw new CustomError("No appointments found for this doctor", 404);
        }

        const updateDoctorAppointments = await this.userModel.updateMany(
          { appointmentRecords: { $in: appointmentIdsToDelete } },
          { $pull: { appointmentRecords: { $in: appointmentIdsToDelete } } },
          { session }
        );
        if (updateDoctorAppointments.modifiedCount === 0) {
          throw new CustomError("Unable to update appointment records for the doctor", 500);
        }
        await session.commitTransaction();
        const messageForDoctor = deletedDoctorMessage(deletedDoctor.name, deletedDoctorFromHospital.name)
        await this.nodemailerService.sendMail(deletedDoctor.email, "Alert", messageForDoctor, deletedDoctor.name)
        const messageForPatients = "We regret to inform you that your appointment with the doctor has been canceled. Please contact us for rescheduling.";
        for (const EmailAndName of patientNameAndEmail) {
          await this.nodemailerService.sendMail(EmailAndName.email, 'Cancelled Appointment', `We regret to inform you that your appointments with the doctor ${deletedDoctor.name} has been cancelled due to doctor are no longer available at ${deletedDoctorFromHospital.name}. Please Rescedule your appointment to other avaliable doctor`, EmailAndName.name)
        }
        return { message: "Doctor and associated records deleted successfully" };
      }
      else {
        const messageForDoctor = deletedDoctorMessage(deletedDoctor.name, deletedDoctorFromHospital.name)
        console.log(messageForDoctor, "message For Doctor");
        console.log(deletedDoctor.phoneNumber, deletedDoctorFromHospital.name, "check cred For Doctor");
        await this.nodemailerService.sendMail(deletedDoctor.email, "Alert", messageForDoctor, deletedDoctor.name)
        await session.commitTransaction();
        return { message: "Doctor and associated records deleted successfully" };
      }
    } catch (error) {
      await session.abortTransaction();
      console.log(error);

      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError("There was an error deleting the doctor", 500);

    } finally {

      session.endSession();
    }
  }
}
