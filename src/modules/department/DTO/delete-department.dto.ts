import { Type } from 'class-transformer';
import { IsNotEmpty, IsEnum, IsArray } from 'class-validator';
import { HospitalDepartment } from 'enums/departments.enum';


export class DeleteDepartmentDto {
    @IsEnum(HospitalDepartment, { each: true })
    @IsArray()
    @IsNotEmpty()
    department: HospitalDepartment[];

}
