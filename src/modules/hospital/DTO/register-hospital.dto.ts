import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, MinLength, IsOptional, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { address } from 'interfaces/address.interface';
import { gender } from 'enums/gender.enum';
class AddressDto {
  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

}
export class RegisterHospitalDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsPhoneNumber(null)
  @IsNotEmpty()
  phoneNumber: string;

  @IsObject()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @IsString()
  @IsNotEmpty()
  medicalLicense: string;

  @IsString()
  @IsNotEmpty()
  CEO: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsOptional()
  @IsString({ each: true })
  departments?: string[];

  @IsOptional()
  @IsString()
  profilePicture?: string;
}
