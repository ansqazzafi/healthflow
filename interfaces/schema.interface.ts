import { Document } from 'mongoose';
import { address } from './address.interface';
import { roles } from '../enums/role.enum';
import { Types } from 'mongoose';
import { Specialty } from '../enums/specialty.enum';
export interface IUser {
  name: string;
  email: string;
  password: string;
  isActive: boolean;
  phoneNumber: string;
  profilePicture?: string;
  isPhoneVerified: boolean;
  refreshToken?: string;
  address: address;
  role?: roles;
  appointmentRecords?: Types.ObjectId[];
  medicalCollege?: string;
  passingYear?: Date;
  degree?: string[];
  degreeId?: string;
  hospital?: Types.ObjectId;
  specialty?: Specialty;
  biography?: string;
  availableDays?: string[];
  availableHours?: string[];
  medicalLicense?: string;
  CEO?: string;
  doctors?: Types.ObjectId[];
  departments?: string[];
  service?: string;
  queries?: { patientId: Types.ObjectId; messageQuery: string }[];
}

