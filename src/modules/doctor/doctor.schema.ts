import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { address } from 'interfaces/address.interface';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../schema/base.schema';
import { Specialty } from 'enums/specialty.enum';

@Schema({ timestamps: true })
export class Doctor extends BaseSchema {
  @Prop({
    required: true,
    type: {
      country: { type: String, required: true },
      city: { type: String, required: true },
    },
  })
  address: address;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Appointment' }],
    required: false,
  })
  appointmentRecords?: Types.ObjectId[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Hospital' }],
    required: false,
  })
  hospitals?: Types.ObjectId[];

  @Prop({ required: true, enum: Specialty })
  specialty: Specialty;

  @Prop({ required: false })
  biography?: string;

  @Prop({ required: false })
  availableDays?: string[];

  @Prop({ required: false })
  availableHours?: string[];
}

export type DoctorDocument = Doctor & Document;

export const DoctorSchema = SchemaFactory.createForClass(Doctor);

DoctorSchema.index({ name: 'text', email: 'text' });
