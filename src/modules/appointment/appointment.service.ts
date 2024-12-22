import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Appointment, AppointmentDocument } from './appointment.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { CustomError } from 'utility/custom-error';
import { BookAppointmentDto } from './DTO/book-appointment.dto';
import { AppointmentStatus, AppointmentType } from 'enums/appointment.enum';
import { User } from '../user/user.schema';
import { roles } from 'enums/role.enum';
import { UpdateAppointment } from './DTO/update-appointment-details';
import { NodemailerService } from 'src/modules/nodemailer/nodemailer.service';
import { ConvertToDate } from 'utility/convert-to-date';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name) private userModel: Model<any>,
    private readonly nodemailerService: NodemailerService,
    @Inject(forwardRef(() => StripeService))
    private readonly stripeService: StripeService,
  ) {}

  public async BookAppointment(
    patientId: string,
    hospitalId: string,
    doctorId: string,
    bookAppointmentDto: BookAppointmentDto,
  ): Promise<any> {
    const session = await this.appointmentModel.db.startSession();
    session.startTransaction();
    try {
      const response = await this.createAppointment(
        patientId,
        hospitalId,
        doctorId,
        bookAppointmentDto,
        session,
      );

      await session.commitTransaction();
      return response;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      if (error instanceof CustomError) {
        throw error;
      }
      console.error('Error during appointment booking:', error);
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

  public async updateAppointmentRecord(
    doctorId: string,
    role: string,
    appointmentId: string,
    updateDto: UpdateAppointment,
  ): Promise<any> {
    let updatedDate;
    try {
      const appointment = await this.appointmentModel.findById(appointmentId);
      if (!appointment) {
        throw new CustomError('Appointment Not Found', 404);
      }
      if (appointment.doctor.toString() !== doctorId) {
        throw new CustomError(
          'This Appointment are not associated with mentioned doctor',
        );
      }

      const patientDetails = await this.userModel.findById(appointment.patient);
      const doctorDetails = await this.userModel.findById(appointment.doctor);
      if (
        appointment.status === AppointmentStatus.COMPLETED ||
        appointment.status === AppointmentStatus.CANCELLED
      ) {
        if (updateDto.status) {
          throw new CustomError(
            'Cannot change status once it is completed, or cancelled',
            400,
          );
        }
      }

      if (
        updateDto.status === AppointmentStatus.APPROVED &&
        appointment.Type === AppointmentType.Online &&
        appointment.status === AppointmentStatus.PENDING
      ) {
        console.log("eNTERED");
        
        const paymentIntend = await this.stripeService.createPaymentIntend(
          appointment._id.toString(),
          patientDetails._id.toString(),
          doctorDetails._id.toString(),
          appointment.hospital.toString()
        );
        console.log(paymentIntend.client_secret, "intend");
        
        const paymentLink = `http://127.0.0.1:5500/src/payment.html?appointment_id=${appointment._id}&client_secret=${paymentIntend.client_secret}`;
        await this.nodemailerService.sendMail(
          patientDetails.email,
          'Payment Request',
          `Dear ${patientDetails.name},\n\nYour online appointment with Dr. ${doctorDetails.name} has been waiting for payment. Please complete your payment by clicking the link below:\n\n${paymentLink}\n\nThank you.`,
          patientDetails.name,
        );
        return true
      } else {
        if (updateDto.status) {
          if (
            updateDto.status === AppointmentStatus.COMPLETED &&
            role === 'doctor'
          ) {
            if (!updateDto.prescription) {
              throw new CustomError(
                'Prescription is required when status is completed',
                400,

              );
            }
          }

          if (
            updateDto.status === AppointmentStatus.CANCELLED &&
            !updateDto.cancelledReason
          ) {
            throw new CustomError(
              'Cancelled reason is required when status is cancelled',
              400,
            );
          }
        }

        const updateFields: any = {};
        let isAppointmentDateUpdated = false;
        if (updateDto.appointmentDate) {
          updatedDate = ConvertToDate(updateDto.appointmentDate);
          updateFields.appointmentDate = updatedDate;
          isAppointmentDateUpdated = true;
        }
        if (updateDto.status) {
          updateFields.status = updateDto.status;
        }
        if (updateDto.cancelledReason) {
          updateFields.cancelledReason = updateDto.cancelledReason;
        }
        if (updateDto.prescription) {
          updateFields.prescription = updateDto.prescription;
        }

        const updatedAppointment =
          await this.appointmentModel.findByIdAndUpdate(
            appointmentId,
            updateFields,
            { new: true },
          );
        if (!updatedAppointment) {
          throw new CustomError('Unable to Update the Appointment', 402);
        }

        let emailSubject = '';
        let emailMessage = '';

        switch (updateDto.status) {
          case AppointmentStatus.COMPLETED:
            emailSubject = 'Your Appointment Status: Completed';
            emailMessage = `Dear ${patientDetails.name},\n\nYour appointment with Dr. ${doctorDetails.name} has been completed. A prescription has been provided. 
            Precription: ${updateDto.prescription}`;
            break;
          case AppointmentStatus.CANCELLED:
            emailSubject = 'Your Appointment Status: Cancelled';
            emailMessage = `Dear ${patientDetails.name},\n\nYour appointment with Dr. ${doctorDetails.name} has been cancelled. Reason: ${updateDto.cancelledReason}`;
            break;
          case AppointmentStatus.APPROVED:
            emailSubject = 'Your Appointment Status: APPROVED';
            emailMessage = `Dear ${patientDetails.name},\n\nYour appointment with Dr. ${doctorDetails.name} has been Approved on ${appointment.appointmentDate.getDate()}`;
            break;
          default:
            emailSubject = 'Your Appointment Status Update';
            emailMessage = `Dear ${patientDetails.name},\n\nYour appointment status has been updated.`;
        }

        if (isAppointmentDateUpdated) {
          emailSubject = 'Your Appointment Date Has Been Updated';
          emailMessage = `Dear ${patientDetails.name},\n\nPlease be informed that the date for your appointment with Dr. ${doctorDetails.name} has been updated to ${updatedDate.toISOString().split('T')[0]}. Due to doctor unavailabilty`;
        }
        console.log(emailMessage, emailSubject, 'Details');
        await this.nodemailerService.sendMail(
          patientDetails.email,
          emailSubject,
          emailMessage,
          patientDetails.name,
        );
        return updatedAppointment;
      }
    } catch (error) {
      console.log('Error:', error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'There is an error during the updation of appointment',
        500,
      );
    }
  }

  private async createAppointment(
    patientId: string,
    hospitalId: string,
    doctorId: string,
    bookAppointmentDto: BookAppointmentDto,
    session: ClientSession,
  ): Promise<any> {
    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    try {
      const appointmentDate = ConvertToDate(bookAppointmentDto.appointmentDate);
      const dayOfWeek = daysOfWeek[appointmentDate.getDay()];
      const doctor = await this.userModel.findById(doctorId).session(session);
      const availableDays = doctor.availableDays;
      if (!availableDays.includes(dayOfWeek)) {
        throw new CustomError(`Doctor are not available on ${dayOfWeek}`);
      }
      const newAppointment = new this.appointmentModel({
        ...bookAppointmentDto,
        hospital: new Types.ObjectId(hospitalId),
        doctor: new Types.ObjectId(doctorId),
        patient: new Types.ObjectId(patientId),
      });

      const appointment = await newAppointment.save({ session });

      if (doctor.hospital !== hospitalId) {
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


  public async updateAppointmentTransactionRecordForOnline(appointmentId:string, paymentIntendId:string, transactionDate):Promise<any>{
    await this.appointmentModel.findByIdAndUpdate(
      appointmentId,
      {
        $set: {
          status: AppointmentStatus.APPROVED, 
          paymentTransactionId: paymentIntendId, 
          paymentCompletedAt: transactionDate.toISOString(),
          transactionStatus:'PAID' 
        },
      }
    )
  }
  
}

