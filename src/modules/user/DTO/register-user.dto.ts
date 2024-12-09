import { Type } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, MinLength, IsObject, ValidateNested, IsEnum } from 'class-validator';
import { gender } from 'enums/gender.enum';


class AddressDto {
    @IsString()
    @IsNotEmpty()
    country: string;

    @IsString()
    @IsNotEmpty()
    city: string;
}
export class RegisterUserDTO{
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
}
