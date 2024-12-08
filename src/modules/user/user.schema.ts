import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { roles } from 'enums/role.enum';
import { address } from 'interfaces/address.interface';
import { Document, Types } from 'mongoose';
import { BaseSchema } from '../schema/base.schema';

@Schema({ timestamps: true })
export class User extends BaseSchema {
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
    type: [
      {
        patientId: { type: Types.ObjectId, ref: 'User', required: true },
        messageQuery: { type: String, required: true },
      },
    ],
    required: false,
  })
  queries?: { patientId: Types.ObjectId; messageQuery: string }[];
  @Prop({ required: false, enum: roles, default: roles.patient })
  role: roles;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ name: 'text', email: 'text' });
