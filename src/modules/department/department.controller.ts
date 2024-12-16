import { Controller, Req, Post, Body, Delete } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { Request } from 'express';
import { roles } from 'enums/role.enum';
import { CustomError } from 'utility/custom-error';
import { ResponseHandler } from 'utility/success-response';
import { HospitalDepartment } from 'enums/departments.enum';
import { AddDepartmentDto } from './DTO/add-department.dto';
import { DeleteDepartmentDto } from './DTO/delete-department.dto';
@Controller('department')
export class DepartmentController {
    constructor(
        private readonly departmentService: DepartmentService,
        private readonly responseHandler: ResponseHandler
    ) { }

    @Post()
    public async addDepartment(
        @Req() req: Request,
        @Body() addDepartmentDto: AddDepartmentDto
    ): Promise<SuccessHandler<any>> {
        const { id, role } = req.user
        if (role !== roles.hospital) {
            throw new CustomError("Only Hospital can add department", 401)
        }
        const response = await this.departmentService.addDepartment(id, addDepartmentDto.department)
        return this.responseHandler.successHandler(true, "Department Added Successfully")
    }

    @Delete()
    public async deleteDepartment(
        @Req() req: Request,
        @Body() deleteDepartmentDto: DeleteDepartmentDto
    ): Promise<SuccessHandler<any>> {
        const { id, role } = req.user
        if (role !== roles.hospital) {
            throw new CustomError("Only Hospital can delete department", 401)
        }
        const response = await this.departmentService.deleteDepartment(id, deleteDepartmentDto.department)
        return this.responseHandler.successHandler(true, "Department Deleted Successfully")
    }
}
