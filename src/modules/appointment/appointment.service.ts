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

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private userModel: Model<any>,
    private readonly twilioService: TwilioService,
  ) {}

  public async updateAppointment(
    userId: string,
    role: string,
    appointmentId: string,
    status: AppointmentStatus,
    reason?: string,
  ): Promise<any> {
    try {
      console.log(userId, appointmentId, status, 'IDS');
      let updatedAppointment;
      if (role === 'doctor') {
        updatedAppointment = await this.appointmentModel.findOneAndUpdate(
          {
            _id: new Types.ObjectId(appointmentId),
            doctor: new Types.ObjectId(userId),
          },
          { $set: { status: status } },
          { new: true },
        );
      } else if (role === 'patient') {
        if (status !== AppointmentStatus.CANCELLED) {
          throw new CustomError(
            'Patients can only cancel their own appointment',
            403,
          );
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

      if (!updatedAppointment) {
        throw new CustomError(
          'Appointment not found or invalid status transition',
          404,
        );
      }
      if (status === AppointmentStatus.CANCELLED && reason) {
        updatedAppointment.cancelledReason = reason;
        await updatedAppointment.save();
        console.log('Cancel reason updated:', reason);
      }

      console.log(updatedAppointment.status, 'Updated Appointment Status');

      const doctor = await this.userModel.findById(updatedAppointment.doctor);
      const patient = await this.userModel.findById(updatedAppointment.patient);
      const hospital = await this.userModel.findById(
        updatedAppointment.hospital,
      );

      if (!doctor || !patient || !hospital) {
        throw new CustomError('Doctor, patient, or hospital not found', 404);
      }

      const doctorName = doctor.name;
      const hospitalName = hospital.name;
      const patientPhoneNumber = patient.phoneNumber;

      const sendMessage = await this.twilioService.sendMessage(
        patientPhoneNumber,
        `Your appointment with Dr. ${doctorName} at ${hospitalName} has been ${status}.` +
          (status === AppointmentStatus.CANCELLED && reason
            ? ` Reason: ${reason}`
            : ''),
      );

      if (!sendMessage) {
        throw new CustomError('Message not sent');
      }

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
      ]);

      console.log('Entities updated:', updateResults);

      // Check if any updates were not successful
      if (updateResults.some((result) => result.modifiedCount === 0)) {
        throw new CustomError(
          'Unable to add the appointment to one or more entities',
          401,
        );
      }

      // Commit the transaction and return the created appointment
      return appointment;
    } catch (error) {
      console.error('Error while booking physical appointment:', error);
      throw new CustomError('Error while booking physical appointment', 500);
    }
  }
}
