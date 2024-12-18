import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Model } from 'mongoose';
import { CustomError } from 'utility/custom-error';
import { UpdatePatientDTO } from './DTO/updateDto';
import { Appointment, AppointmentDocument } from '../appointment/appointment.schema';
import { roles } from 'enums/role.enum';
import { TwilioService } from '../twilio/twilio.service';
import { NodemailerService } from 'src/modules/nodemailer/nodemailer.service';
@Injectable()
export class PatientService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Appointment.name) private appointmentModel: Model<AppointmentDocument>,
    private readonly twilioService: TwilioService,
    private readonly nodemailerService: NodemailerService
  ) { }

  public async findPatients(
    page: number,
    limit: number,
    city: string,
    name: string,
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const aggregation = await this.userModel.aggregate([
        {
          $match: {
            role: 'patient',
            ...(name && { name: { $regex: name, $options: 'i' } }),
            ...(city && { 'address.city': city }),
          },
        },
        {
          $facet: {
            patients: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ]);
      if (aggregation[0].patients.length === 0) {
        throw new CustomError('No Patient Found', 404);
      }
      const result = {
        patients: aggregation[0]?.patients || [],
        totalCount: aggregation[0]?.totalCount[0]?.count || 0,
      };
      return result;
    } catch (error) {
      console.log(error, 'err');

      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error during fetching Patients', 500);
    }
  }

  public async findOne(id): Promise<any> {
    try {
      const patient = await this.userModel
        .findOne({ _id: id })
        .select(
          '-password -refreshToken -doctors -departments -availableDays -availableHours -degree',
        );
      if (!patient) {
        throw new CustomError('patient not found', 404);
      }
      return patient;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('there is an error to find patient', 500);
    }
  }

  public async updateProfile(id, updateDto: UpdatePatientDTO): Promise<any> {
    try {
      console.log(updateDto, 'ffff');
      const updatedPatient = await this.userModel
        .findByIdAndUpdate(id, { $set: updateDto }, { new: true })
        .select(
          '-password -refreshToken -doctors -departments -availableDays -availableHours -degree',
        );

      if (!updatedPatient) {
        throw new CustomError('Patient not found', 404);
      }

      return updatedPatient;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There was an error updating the Profile', 500);
    }
  }

  public async deletePatient(id: string, role: string): Promise<any> {
    const session = await this.userModel.db.startSession();
    if (role !== roles.patient) {
      throw new CustomError("Only patient can deleted its account", 401)
    }

    try {
      session.startTransaction();

      const deletedPatient = await this.userModel.findByIdAndDelete(id).session(session);
      if (!deletedPatient) {
        throw new CustomError("Patient Not Found", 404);
      }

      const appointmentIDs = deletedPatient.appointmentRecords;

      if (appointmentIDs && appointmentIDs.length > 0) {
        await this.appointmentModel.deleteMany(
          { _id: { $in: appointmentIDs } },
          { session }
        );
      }
      if (appointmentIDs && appointmentIDs.length > 0) {
        await this.userModel.updateMany(
          { appointmentRecords: { $in: appointmentIDs } },
          { $pull: { appointmentRecords: { $in: appointmentIDs } } },
          { session }
        );
      }
      await this.nodemailerService.sendMail(deletedPatient.email, 'Account Deleted', `Your Account corresponding ${deletedPatient.email} are deleted Successfully from HealthFlow`, deletedPatient.name)
      await session.commitTransaction();
      return { message: "Patient and associated appointments deleted successfully" };

    } catch (error) {
      await session.abortTransaction();
      if (error instanceof CustomError) {
        throw error;
      }

      throw new CustomError("There was an error deleting the account", 500);
    } finally {
      session.endSession();
    }
  }


}
