import { Type } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, MinLength, IsObject, ValidateNested, IsEnum, IsOptional, IsArray } from 'class-validator';
import { gender } from 'enums/gender.enum';
import { Specialty } from 'enums/specialty.enum';
class AddressDto {
    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    city?: string;
}

export class UpdateDoctorDTO {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @IsObject()
    @ValidateNested()
    @IsOptional()
    @Type(() => AddressDto)
    address?: AddressDto;

    @IsPhoneNumber(null)
    @IsOptional()
    phoneNumber?: string;

    @IsString()
    @IsOptional()
    profilePicture?: string;

    @IsString()
    @IsOptional()
    biography?: string;

    @IsEnum(Specialty)
    @IsOptional()
    specialty?: Specialty;

    @IsArray()
    @IsOptional()
    availableDays?: string[];

    @IsArray()
    @IsOptional()
    availableHours?: string[];
}
