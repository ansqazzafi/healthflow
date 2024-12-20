import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { AppointmentStatus } from 'enums/appointment.enum';


export class UpdateAppointment {
  @IsOptional()
  @IsDateString()
  appointmentDate?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.PENDING;


  @IsOptional()
  @IsString()
  cancelledReason?: string


  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsString()
  prescription?: string;

}
