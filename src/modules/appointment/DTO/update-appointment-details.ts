import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
} from 'class-validator';
import { AppointmentStatus } from 'enums/appointment.enum';
import { AppointmentType } from 'enums/appointment.enum';

export class UpdateAppointment {
  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  prescription?: string;

}
