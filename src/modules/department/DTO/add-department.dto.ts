import { Type } from 'class-transformer';
import { IsString, IsEmail, IsNotEmpty, IsPhoneNumber, MinLength, IsObject, ValidateNested, IsEnum, IsOptional, IsArray } from 'class-validator';
import { HospitalDepartment } from 'enums/departments.enum';
import { gender } from 'enums/gender.enum';
import { Specialty } from 'enums/specialty.enum';

export class AddDepartmentDto {
    @IsEnum(HospitalDepartment, { each: true })
    @IsArray()
    @IsNotEmpty()
    department: HospitalDepartment[];

}
