import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { address } from 'interfaces/address.interface';
import { gender } from 'enums/gender.enum';

class AddressDto {
  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;
}

export class UpdateHospitalDTO {
  @IsString()
  @IsOptional()
  name?: string;

  @IsPhoneNumber(null)
  @IsOptional()
  phoneNumber?: string;

  @IsObject()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @IsString()
  @IsOptional()
  CEO?: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  profilePicture?: string;
}
