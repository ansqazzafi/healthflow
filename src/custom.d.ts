import { UserDocument } from 'src/modules/user/user.schema';
import { DoctorDocument } from 'src/modules/doctor/doctor.schema';
import { HospitalDocument } from 'src/modules/hospital/hospital.schema';

declare global {
  namespace Express {
    interface Request {
      entity?: UserDocument | DoctorDocument | HospitalDocument;
    }
  }
}
