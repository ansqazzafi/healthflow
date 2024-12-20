
import { IsNotEmpty, IsEnum, IsArray } from 'class-validator';
import { HospitalDepartment } from 'enums/departments.enum';

export class AddDepartmentDto {
    @IsEnum(HospitalDepartment, { each: true })
    @IsArray()
    @IsNotEmpty()
    department: HospitalDepartment[];

}
