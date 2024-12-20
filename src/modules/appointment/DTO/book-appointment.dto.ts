import { Transform } from 'class-transformer';
import { IsDate, IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from 'enums/appointment.enum';
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
