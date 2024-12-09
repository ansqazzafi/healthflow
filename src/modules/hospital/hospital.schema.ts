import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { address } from 'interfaces/address.interface';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../schema/base.schema';
import { roles } from 'enums/role.enum';
@Schema({ timestamps: true })
export class Hospital extends BaseSchema {
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
    type: [{ type: Types.ObjectId, ref: 'Doctor' }],
    required: false,
  })
  doctors?: Types.ObjectId[];

  @Prop({
    required: false,
  })
  departments?: string[];

  @Prop({ required: true, unique: true })
  medicalLicense: string;

  @Prop({ required: true })
  CEO: string;

  @Prop({ required: false })
  biography?: string;

  @Prop({ enum: roles, default: roles.hospital })
  role: roles;
}

export type HospitalDocument = Hospital & Document;
export const HospitalSchema = SchemaFactory.createForClass(Hospital);
HospitalSchema.index({
  name: 'text',
  email: 'text',
  medicalLicense: 1,
  phoneNumber: 1,
});
