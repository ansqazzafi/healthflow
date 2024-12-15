import { Transform } from 'class-transformer';
import { IsDate, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from 'enums/appointment.enum';
import { AppointmentType } from 'enums/appointment.enum';

export class BookAppointmentDto {
  @Transform(({ value }) => new Date(value)) // Automatically transform string to Date
  @IsDate()
  appointmentDate: Date; 

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.PENDING; 

  @IsOptional()
  @IsString()
  cancelledReason?: string; 

  @IsOptional()
  @IsString()
  feedback?: string; 

  @IsOptional()
  @IsString()
  prescription?: string; 

  @IsOptional()
  @IsString()
  description?: string;  

  @IsOptional()
  @IsEnum(AppointmentType)
  Type?: AppointmentType; 
}
