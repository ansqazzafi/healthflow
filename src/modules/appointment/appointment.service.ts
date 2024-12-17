import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { ClientSession, Model, ObjectId, Types } from 'mongoose';
import { CustomError } from 'utility/custom-error';
import { BookAppointmentDto } from './DTO/book-appointment.dto';
import { AppointmentStatus, AppointmentType } from 'enums/appointment.enum';
import { User } from '../user/user.schema';
import { roles } from 'enums/role.enum';
import { log } from 'console';
import { TwilioService } from '../twilio/twilio.service';
import { stat } from 'fs';
import { CANCELLED } from 'dns';
import { identity } from 'rxjs';
import { strict } from 'assert';
import { UpdateDoctorDTO } from '../doctor/DTO/update-doctor.dto';
import { UpdateAppointment } from './DTO/update-appointment-details';
import { NodemailerService } from 'src/nodemailer/nodemailer.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private userModel: Model<any>,
    private readonly twilioService: TwilioService,
    private readonly nodemailerService: NodemailerService
  ) { }

  // public async updateAppointmentStatus(
  //   userId: string,
  //   role: roles,
  //   appointmentId: string,
  //   status: AppointmentStatus,
  //   reason?: string,
  // ): Promise<any> {
  //   try {
  //     console.log(userId, appointmentId, status, 'IDS');
  //     let updatedAppointment;
  //     if (role === 'doctor') {
  //       updatedAppointment = await this.appointmentModel.findOneAndUpdate(
  //         {
  //           _id: new Types.ObjectId(appointmentId),
  //           doctor: new Types.ObjectId(userId),
  //         },
  //         { $set: { status: status } },
  //         { new: true },
  //       );
  //     } else if (role === 'patientCare') {
  //       updatedAppointment = await this.appointmentModel.findOneAndUpdate(
  //         {
  //           _id: new Types.ObjectId(appointmentId),
  //         },
  //         { $set: { status: status } },
  //         { new: true },
  //       );
  //     } else if (role === 'patient') {
  //       if (status !== AppointmentStatus.CANCELLED) {
  //         throw new CustomError(
  //           'Patients can only cancel their own appointment',
  //           403,
  //         );
  //       }

  //       updatedAppointment = await this.appointmentModel.findOneAndUpdate(
  //         {
  //           _id: new Types.ObjectId(appointmentId),
  //           patient: new Types.ObjectId(userId),
  //         },
  //         { $set: { status: status } },
  //         { new: true },
  //       );
  //     } else {
  //       throw new CustomError("Sorry you can't modify status", 401);
  //     }

  //     if (!updatedAppointment) {
  //       throw new CustomError(
  //         'Appointment not found or invalid status transition',
  //         404,
  //       );
  //     }
  //     if (status === AppointmentStatus.CANCELLED && reason) {
  //       updatedAppointment.cancelledReason = reason;
  //       await updatedAppointment.save();
  //       console.log('Cancel reason updated:', reason);
  //     }
  //     console.log(updatedAppointment.status, 'Updated Appointment Status');
  //     const doctor = await this.userModel.findById(updatedAppointment.doctor);
  //     const patient = await this.userModel.findById(updatedAppointment.patient);
  //     const hospital = await this.userModel.findById(
  //       updatedAppointment.hospital,
  //     );

  //     if (!doctor || !patient || !hospital) {
  //       throw new CustomError('Doctor, patient, or hospital not found', 404);
  //     }

  //     const doctorName = doctor.name;
  //     const hospitalName = hospital.name;
  //     const patientPhoneNumber = patient.phoneNumber;

  //     const sendMessage = await this.nodemailerService.sendMail(
  //       patient.email,
  //       'Appointment Approved',
  //       `Your appointment with Dr. ${doctorName} at ${hospitalName} has been ${status}.` +
  //       (status === AppointmentStatus.CANCELLED && reason
  //         ? ` Reason: ${reason}`
  //         : ''),
  //       patient.name
  //     );

  //     return {
  //       success: true,
  //       message: `Appointment ${status} successfully`,
  //       appointment: updatedAppointment,
  //     };
  //   } catch (error) {
  //     console.log(error, 'Error');
  //     if (error instanceof CustomError) {
  //       throw error;
  //     }
  //     throw new CustomError('There is an error updating the appointment', 500);
  //   }
  // }



  public async updateAppointmentStatus(
    userId: string,
    role: roles,
    appointmentId: string,
    status: AppointmentStatus,
    reason?: string,
  ): Promise<any> {
    try {
      console.log(userId, appointmentId, status, 'IDS');
      let updatedAppointment;
  
      const currentAppointment = await this.appointmentModel.findById(
        new Types.ObjectId(appointmentId),
      );
  
      if (!currentAppointment) {
        throw new CustomError('Appointment not found', 404);
      }
  
      if (currentAppointment.status === AppointmentStatus.APPROVED) {
        if (status === AppointmentStatus.APPROVED) {
          throw new CustomError('Appointment is already approved, status cannot be updated to approved again', 400);
        }

        if (![AppointmentStatus.CANCELLED, AppointmentStatus.MISSED, AppointmentStatus.COMPLETED].includes(status)) {
          throw new CustomError('You can only update an approved appointment to cancelled, completed or missed', 400);
        }
      }
  
      if (currentAppointment.status === AppointmentStatus.CANCELLED) {
        throw new CustomError('Appointment is already cancelled, status cannot be changed', 400);
      }
      if (currentAppointment.status === AppointmentStatus.COMPLETED) {
        throw new CustomError('Appointment Completed, status cannot be changed', 400);
      }

      if (role === 'doctor') {
        updatedAppointment = await this.appointmentModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(appointmentId),
            doctor: new Types.ObjectId(userId),
          },
          { $set: { status: status } },
          { new: true },
        );
      } else if (role === 'patientCare') {
        updatedAppointment = await this.appointmentModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(appointmentId),
          },
          { $set: { status: status } },
          { new: true },
        );
      } else if (role === 'patient') {
        if (status !== AppointmentStatus.CANCELLED) {
          throw new CustomError('Patients can only cancel their own appointment', 403);
        }
  
        updatedAppointment = await this.appointmentModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(appointmentId),
            patient: new Types.ObjectId(userId),
          },
          { $set: { status: status } },
          { new: true },
        );
      } else {
        throw new CustomError("Sorry you can't modify status", 401);
      }
  
      // If appointment is not found or invalid status transition
      if (!updatedAppointment) {
        throw new CustomError('Appointment not found or invalid status transition', 404);
      }
  
      // If the status is cancelled and reason is provided, update the reason
      if (status === AppointmentStatus.CANCELLED && reason) {
        updatedAppointment.cancelledReason = reason;
        await updatedAppointment.save();
        console.log('Cancel reason updated:', reason);
      }
  
      console.log(updatedAppointment.status, 'Updated Appointment Status');
      const doctor = await this.userModel.findById(updatedAppointment.doctor);
      const patient = await this.userModel.findById(updatedAppointment.patient);
      const hospital = await this.userModel.findById(updatedAppointment.hospital);
  
      if (!doctor || !patient || !hospital) {
        throw new CustomError('Doctor, patient, or hospital not found', 404);
      }
  
      const doctorName = doctor.name;
      const hospitalName = hospital.name;
      const patientPhoneNumber = patient.phoneNumber;
  
      const sendMessage = await this.nodemailerService.sendMail(
        patient.email,
        'Appointment Status Update',
        `Your appointment with Dr. ${doctorName} at ${hospitalName} has been ${status}.` +
          (status === AppointmentStatus.CANCELLED && reason ? ` Reason: ${reason}` : ''),
        patient.name,
      );
  
      return {
        success: true,
        message: `Appointment ${status} successfully`,
        appointment: updatedAppointment,
      };
    } catch (error) {
      console.log(error, 'Error');
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error updating the appointment', 500);
    }
  }

  public async BookAppointment(
    patientId: string,
    hospitalId: string,
    doctorId: string,
    bookAppointmentDto: BookAppointmentDto,
  ): Promise<any> {
    const session = await this.appointmentModel.db.startSession();
    session.startTransaction();
    console.log(
      patientId,
      hospitalId,
      doctorId,
      bookAppointmentDto,
      'service data',
    );
    try {
      const { Type } = bookAppointmentDto;
      if (Type === AppointmentType.Physical) {
        const response = await this.physicalAppointment(
          patientId,
          hospitalId,
          doctorId,
          bookAppointmentDto,
          session,
        );
        await session.commitTransaction();
        return { success: true, appointment: response };
      } else {
        throw new CustomError('Invalid appointment type', 400);
      }
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error during appointment booking:', error); // Add logging for debugging
      throw new CustomError(
        'There is an error during the booking of Appointment',
        500,
      );
    }
  }

  public async findAppointments(
    id: string,
    role: roles,
    page: number,
    limit: number,
    date?: Date,
  ): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const objId = new Types.ObjectId(id);
      const aggregation = await this.appointmentModel.aggregate([
        {
          $match: {
            ...(role === roles.patient && { patient: objId }),
            ...(role === roles.hospital && { hospital: objId }),
            ...(role === roles.doctor && { doctor: objId }),
            ...(role === roles.admin || role === roles.patientCare ? {} : null),
            ...(date && {
              appointmentDate: {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lte: new Date(date.setHours(23, 59, 59, 999)),
              },
            }),
          },
        },
        {
          $facet: {
            appointments: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ]);

      if (aggregation[0].appointments.length === 0) {
        throw new CustomError('No appointments found', 404);
      }

      const result = {
        appointments: aggregation[0]?.appointments || [],
        totalCount: aggregation[0]?.totalCount[0]?.count || 0,
      };

      return result;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error finding the appointments', 500);
    }
  }

  public async findOne(
    id: string,
    role: roles,
    appointmentId: string,
  ): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(appointmentId)) {
        throw new CustomError('Invalid appointment ID format', 400);
      }
      const aggregation = await this.appointmentModel.aggregate([
        {
          $match: {
            _id: new Types.ObjectId(appointmentId),
            ...(role === roles.patient && { patient: new Types.ObjectId(id) }),
            ...(role === roles.hospital && {
              hospital: new Types.ObjectId(id),
            }),
            ...(role === roles.doctor && { doctor: new Types.ObjectId(id) }),
            ...(role === roles.admin || role === roles.patientCare ? {} : null),
          },
        },
      ]);
      console.log('error', aggregation);

      if (aggregation.length === 0) {
        console.log(aggregation.length, 'Length ');

        throw new CustomError(
          'You are not authorized to access this appointment',
          403,
        );
      }

      return aggregation[0];
    } catch (error) {
      console.log('Error details:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'There is an error while finding the Appointment',
        500,
      );
    }
  }

  private async physicalAppointment(
    patientId: string,
    hospitalId: string,
    doctorId: string,
    bookAppointmentDto: BookAppointmentDto,
    session: ClientSession,
  ): Promise<any> {
    try {
      console.log(
        `Booking appointment for patient: ${patientId}, doctor: ${doctorId}, hospital: ${hospitalId}`,
      );

      const newAppointment = new this.appointmentModel({
        ...bookAppointmentDto,
        hospital: new Types.ObjectId(hospitalId),
        doctor: new Types.ObjectId(doctorId),
        patient: new Types.ObjectId(patientId),
      });

      const appointment = await newAppointment.save({ session });
      console.log('Appointment successfully created:', appointment);

      const checkIds = await this.userModel.findById(doctorId);
      console.log(checkIds, 'idss');
      console.log(checkIds.hospital, 'Compare', hospitalId);

      if (checkIds.hospital !== hospitalId) {
        throw new CustomError(
          'Doctor and Hospital are not associated with Each Other',
          402,
        );
      }

      const updateResults = await Promise.all([
        this.userModel.updateOne(
          { _id: patientId, role: roles.patient },
          { $push: { appointmentRecords: appointment._id } },
          { session },
        ),
        this.userModel.updateOne(
          { _id: doctorId, role: roles.doctor },
          { $push: { appointmentRecords: appointment._id } },
          { session },
        ),
        this.userModel.updateOne(
          { _id: hospitalId, role: roles.hospital },
          { $push: { appointmentRecords: appointment._id } },
          { session },
        ),
        this.userModel.updateOne(
          { role: roles.admin },
          { $push: { appointmentRecords: appointment._id } },
          { session },
        ),
        this.userModel.updateOne(
          { role: roles.patientCare },
          { $push: { appointmentRecords: appointment._id } },
          { session },
        ),
      ]);

      console.log('Entities updated:', updateResults);

      if (updateResults.some((result) => result.modifiedCount === 0)) {
        throw new CustomError(
          'Unable to add the appointment to one or more entities',
          401,
        );
      }
      return appointment;
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error while booking physical appointment:', error);
      throw new CustomError('Error while booking physical appointment', 500);
    }
  }
}
