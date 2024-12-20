import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsObject,
  IsMongoId,
} from 'class-validator';
import { Types } from 'mongoose';


export class ReportQuery {
  @IsNotEmpty()
  @IsString()
  email:string

  @IsNotEmpty()
  @IsString()
  messageQuery:string
}
