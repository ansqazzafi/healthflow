import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../user/user.schema';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { AppointmentService } from '../appointment/appointment.service';
import { DoctorService } from '../doctor/doctor.service';
import { error } from 'console';
import { CustomError } from 'utility/custom-error';
import { HospitalService } from '../hospital/hospital.service';
import { NodemailerService } from '../nodemailer/nodemailer.service';
import { UserService } from '../user/user.service';

@Injectable()
export class StripeService {
  private stripe: Stripe;
  constructor(
    @Inject(forwardRef(() => AppointmentService))
    private readonly appointmentService: AppointmentService,
    private readonly userservice: UserService,
    private readonly nodemailerService: NodemailerService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  public async createPaymentIntend(
    appointmentId,
    patientId,
    doctorId,
    hospitalId,
  ): Promise<Stripe.PaymentIntent | null> {
    try {
      console.log(appointmentId, patientId, doctorId, hospitalId, 'IDSS');

      const amount = 5000;
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        description: `Payment for appointment ID: ${appointmentId}`,
        metadata: {
          appointment_id: appointmentId,
          patient_id: patientId,
          doctor_id: doctorId,
          hospital_id: hospitalId,
        },
      });
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  public async updations(paymentIntend): Promise<any> {
    const { appointment_id, doctor_id, hospital_id, patient_id } =
      paymentIntend.metadata;
    const transactionDate = new Date(paymentIntend.created * 1000);
    const doctor = await this.userservice.findUser(doctor_id);
    const hospital = await this.userservice.findUser(hospital_id);
    const patient = await this.userservice.findUser(patient_id);
    const updatedAppoinmet =
      await this.appointmentService.updateAppointmentTransactionRecordForOnline(
        appointment_id,
        paymentIntend.id,
        transactionDate,
      );
    await this.nodemailerService.sendMail(
      doctor.email,
      'Payment Approved',
      `Dear ${doctor.name},\n\nYour online appointment with. ${patient.name} has been Approved by Healthflow ${patient.name} Performed his transaction for online successfully.\n\nThank you`,
      doctor.name,
    );
    await this.nodemailerService.sendMail(
      hospital.email,
      'Payment Approved',
      `Hey ${hospital.name},\n\nAppointment with. ${patient.name} corresponding ${doctor.name} has been Approved by Healthflow ${patient.name} Performed his transaction for online successfully.\n\nThank you`,
      hospital.name,
    );
    await this.nodemailerService.sendMail(
      patient.email,
      'Appointment Approved',
      `Dear ${patient.name},\n\nYour Appointment with. ${doctor.name} corresponding ${hospital.name} has been Approved.\n\nThank you`,
      hospital.name,
    );
  }
}
