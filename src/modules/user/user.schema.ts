import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';
import { roles } from 'enums/role.enum';
import { gender } from 'enums/gender.enum';
import { Specialty } from 'enums/specialty.enum';
import { address } from 'interfaces/address.interface';

@Schema({ timestamps: true})
export class User {
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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Appointment' }] })
  appointmentRecords?: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = User & Document;

@Schema()
export class Doctor extends User {
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
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
@Schema()
export class Hospital extends User {
  @Prop({ unique: true })
  medicalLicense?: string;

  @Prop()
  CEO?: string;

  @Prop()
  biography?: string;

  @Prop({ type: [{ type: Types.ObjectId }] })
  doctors?: Types.ObjectId[];

  @Prop()
  departments?: string[];

  @Prop()
  service?: string
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);
@Schema()
export class Admin extends User {

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

export const AdminSchema = SchemaFactory.createForClass(Admin);
@Schema()
export class PatientCare extends User {

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

export const PatientCareSchema = SchemaFactory.createForClass(PatientCare);
export class Patient extends User {

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

export const PatientSchema = SchemaFactory.createForClass(Patient);

export const DiscriminatorUserModel = (baseModel: MongooseSchema) => {
  return {
    Doctor: baseModel.discriminator('Doctor', DoctorSchema),
    Hospital: baseModel.discriminator('Hospital', HospitalSchema),
    Admin: baseModel.discriminator('Admin', AdminSchema),
    Patient: baseModel.discriminator('Patient', PatientSchema),
    PatientCare: baseModel.discriminator('PatientCare', PatientCareSchema),
  };
};
// @Schema({ timestamps: true, strict:true })
// export class User {
//   // Base schema properties
//   @Prop({ required: true })
//   name: string;

//   @Prop({ required: true, unique: true })
//   email: string;

//   @Prop({ required: true })
//   password: string;

//   @Prop({ required: true, default: false })
//   isActive: boolean;

//   @Prop({ required: true, unique: true })
//   phoneNumber: string;

//   @Prop()
//   profilePicture?: string;

//   @Prop({ required: true, default: false })
//   isPhoneVerified: boolean;

//   @Prop()
//   refreshToken?: string;

//   // Address (common for all entities)
//   @Prop({
//     required: true,
//     type: {
//       country: { type: String, required: true },
//       city: { type: String, required: true },
//     },
//   })
//   address: address;

//   // User-specific properties
//   @Prop({ type: [{ type: Types.ObjectId, ref: 'Appointment' }] })
//   appointmentRecords?: Types.ObjectId[];

//   @Prop({
//     type: [
//       {
//         patientId: { type: Types.ObjectId, ref: 'User', required: true },
//         messageQuery: { type: String, required: true },
//       },
//     ],
//   })
//   queries?: { patientId: Types.ObjectId; messageQuery: string }[];

//   @Prop({ enum: gender })
//   gender?: gender;

//   // Hospital-specific properties
//   @Prop({ unique: true })
//   medicalLicense?: string;

//   @Prop()
//   CEO?: string;

//   @Prop()
//   biography?: string;

//   @Prop({ type: [{ type: Types.ObjectId }], required: false })
//   doctors?: Types.ObjectId[];

//   @Prop()
//   departments?: string[];

//   // Doctor-specific properties
//   @Prop()
//   medicalCollege?: string;

//   @Prop()
//   passingYear?: Date;

//   @Prop()
//   degree?: string[];

//   @Prop()
//   degreeId?: string;

//   @Prop({ type: Types.ObjectId })
//   hospital?: Types.ObjectId;

//   @Prop({ enum: Specialty })
//   specialty?: Specialty;

//   @Prop()
//   doctorBiography?: string;

//   @Prop()
//   availableDays?: string[];

//   @Prop()
//   availableHours?: string[];

//   // Role and Gender Enum
//   @Prop({ enum: roles, default: roles.patient })
//   role?: roles;
// }

// export type UserDocument = User & Document;
// export const UserSchema = SchemaFactory.createForClass(User);

// // Sparse index for optional field (unique constraints)
// UserSchema.index({ name: 'text', email: 'text' });
// UserSchema.index({ medicalLicense: 1 }, { sparse: true });
