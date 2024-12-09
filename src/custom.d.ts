import * as express from 'express';
import { User, UserDocument } from './modules/user/user.schema';
import { Doctor, DoctorDocument } from './modules/doctor/doctor.schema';
import { Hospital, HospitalDocument } from './modules/hospital/hospital.schema';
declare global {
  namespace Express {
    interface Request {
      entity?: UserDocument | DoctorDocument | HospitalDocument;
    }
  }
}
