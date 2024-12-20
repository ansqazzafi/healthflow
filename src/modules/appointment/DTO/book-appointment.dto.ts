import { IsDateString, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AppointmentType } from 'enums/appointment.enum';

export class BookAppointmentDto {
  @IsNotEmpty()
  @IsDateString()
  appointmentDate: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(AppointmentType)
  Type: AppointmentType;
}
