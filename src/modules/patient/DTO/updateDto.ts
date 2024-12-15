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

export class UpdatePatientDTO {
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

  @IsOptional()
  @IsString()
  @IsOptional()
  profilePicture?: string;
}
