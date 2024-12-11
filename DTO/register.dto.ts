import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested, IsDefined, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { RegisterUserDTO } from 'src/modules/user/DTO/register-user.dto';
import { RegisterDoctorDTO } from 'src/modules/doctor/DTO/register-doctor.dto';
import { RegisterHospitalDTO } from 'src/modules/hospital/DTO/register-hospital.dto';
import { roles } from 'enums/role.enum';


export class RegisterDto {

   


    @IsEnum(roles)
    @IsNotEmpty()
    role: roles; 

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => RegisterUserDTO) 
    @IsOptional()
    patient?: RegisterUserDTO;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => RegisterDoctorDTO)
    @IsOptional()
    doctor?: RegisterDoctorDTO;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => RegisterHospitalDTO)
    @IsOptional()
    hospital?: RegisterHospitalDTO;
}
