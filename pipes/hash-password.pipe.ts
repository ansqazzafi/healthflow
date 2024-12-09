import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CustomError } from 'utility/custom-error';

@Injectable()
export class HashPasswordPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const { role } = value;  
    if (role === 'patient' && value.patient?.password) {
      value.patient.password = await bcrypt.hash(value.patient.password, 10);
    } else if (role === 'doctor' && value.doctor?.password) {
      value.doctor.password = await bcrypt.hash(value.doctor.password, 10);
    } else if (role === 'hospital' && value.hospital?.password) {
      value.hospital.password = await bcrypt.hash(value.hospital.password, 10);
    } else {
      throw new CustomError('Password is required for the registration', 401);
    }

    return value;
  }
}
