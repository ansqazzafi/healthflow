import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from 'enums/appointment.enum';
import { AppointmentType } from 'enums/appointment.enum';

export class BookAppointmentDto {
  @Transform(({ value }) => new Date(value)) 
  @IsDate()
  appointmentDate: Date; 

  @IsNotEmpty()
  @IsString()
  description: string;  

  @IsNotEmpty()
  @IsEnum(AppointmentType)
  Type: AppointmentType; 
}
