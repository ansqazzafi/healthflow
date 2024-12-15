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

class AddressDto {
  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;
}

export class UpdatePatientCareDTO {
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
