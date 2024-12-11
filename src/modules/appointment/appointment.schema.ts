import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AppointmentStatus } from 'enums/appointment.enum';
import { Document, Types } from 'mongoose';
import { AppointmentType } from 'enums/appointment.enum';
@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patient: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor', required: true })
  doctor: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Hospital', required: true })
  hospital: Types.ObjectId;

  @Prop({ required: true })
  appointmentDate: Date;

  @Prop({
    required: true,
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING
  })
  status?: AppointmentStatus;

  @Prop({ required: false })
  reason?: string;

  @Prop({ required: false })
  feedback?: string;

  @Prop({ required: false })
  prescription?: string;

  @Prop({ required: false, enum: AppointmentType, })
  Type?: AppointmentType;
}

export type AppointmentDocument = Appointment & Document;
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

AppointmentSchema.index({ patient: 1, doctor: 1, appointmentDate: 1 });
