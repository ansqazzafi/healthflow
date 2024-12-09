import { Type } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, MinLength, IsObject, ValidateNested, IsEnum, IsOptional, IsArray } from 'class-validator';
import { gender } from 'enums/gender.enum';
import { Specialty } from 'enums/specialty.enum';

class AddressDto {
    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    city: string;
}

export class RegisterDoctorDTO {
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

    @IsObject()
    @ValidateNested()
    @IsNotEmpty()
    @Type(() => AddressDto)
    address: AddressDto;

    @IsPhoneNumber(null)
    @IsNotEmpty()
    phoneNumber: string;

    @IsEnum(gender)
    @IsNotEmpty()
    gender: gender;

    @IsString()
    @IsNotEmpty()
    profilePicture: string;

    @IsString()
    @IsOptional() 
    biography?: string;

    @IsEnum(Specialty)
    @IsNotEmpty()
    specialty: Specialty;

    @IsArray()
    @IsOptional() 
    availableDays?: string[];

    @IsArray()
    @IsOptional() 
    availableHours?: string[];
}
