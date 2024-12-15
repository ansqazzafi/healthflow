import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';
import { roles } from 'enums/role.enum';
import { Specialty } from 'enums/specialty.enum';
import { address } from 'interfaces/address.interface';
import { IUser } from 'interfaces/schema.interface';
@Schema({ timestamps: true })
export class User extends Document implements IUser {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop()
  profilePicture?: string;

  @Prop({ default: false })
  isPhoneVerified: boolean;

  @Prop()
  refreshToken?: string;

  @Prop({
    required: true,
    type: {
      country: { type: String, required: true },
      city: { type: String, required: true },
    },
  })
  address: address;

  @Prop({ enum: roles, default: roles.patient })
  role?: roles;

  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Appointment' }],
    required: false,
  })
  appointmentRecords: Types.ObjectId[];

  // Fields related to specific roles
  @Prop()
  medicalCollege?: string;

  @Prop()
  passingYear?: Date;

  @Prop()
  degree?: string[];

  @Prop()
  degreeId?: string;

  @Prop({ type: Types.ObjectId })
  hospital?: Types.ObjectId;

  @Prop({ enum: Specialty })
  specialty?: Specialty;

  @Prop()
  biography?: string;

  @Prop()
  availableDays?: string[];

  @Prop()
  availableHours?: string[];

  @Prop()
  medicalLicense?: string;

  @Prop()
  CEO?: string;

  @Prop({ type: [{ type: Types.ObjectId }] })
  doctors?: Types.ObjectId[];

  @Prop()
  departments?: string[];

  @Prop()
  service?: string;

  @Prop({
    type: [
      {
        patientId: { type: Types.ObjectId, ref: 'User', required: true },
        messageQuery: { type: String, required: true },
      },
    ],
  })
  queries?: { patientId: Types.ObjectId; messageQuery: string }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;

UserSchema.pre('save', function (next) {
  const user = this;

  if (Array.isArray(user.degree) && user.degree.length === 0) {
    user.degree = undefined;
  }

  if (Array.isArray(user.availableDays) && user.availableDays.length === 0) {
    user.availableDays = undefined;
  }

  if (Array.isArray(user.availableHours) && user.availableHours.length === 0) {
    user.availableHours = undefined;
  }

  if (Array.isArray(user.doctors) && user.doctors.length === 0) {
    user.doctors = undefined;
  }

  if (Array.isArray(user.queries) && user.queries.length === 0) {
    user.queries = undefined;
  }

  if (Array.isArray(user.appointmentRecords) && user.appointmentRecords.length === 0) {
    user.appointmentRecords = undefined;
  }

  if (Array.isArray(user.departments) && user.departments.length === 0) {
    user.departments = undefined;
  }

  if (Array.isArray(user.queries) && user.queries.length === 0) {
    user.queries = undefined;

  }

  // Call next() to proceed with the save operation
  next();
});