import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PatientCareService } from './patient-care.service';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { ResponseHandler } from 'utility/success-response';
import { UpdatePatientCareDTO } from './DTO/updatedto';
import { roles } from 'enums/role.enum';
import { CustomError } from 'utility/custom-error';
import { Request } from 'express';
import { VerifyAdminGuard } from 'guards/verify-admin.guard';
@Controller('patient-care')
export class PatientCareController {
  constructor(
    private readonly patientCareService: PatientCareService,
    private readonly responseHandler: ResponseHandler,
  ) {}

  @Get()
  @UseGuards(VerifyAdminGuard)
  public async findPatientCareStaff(
    @Query('name') name?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('city') city?: string,
  ): Promise<SuccessHandler<any>> {
    console.log('entered');

    console.log(page, limit, city);
    const newPage = parseInt(page, 10);
    const newLimit = parseInt(limit, 10);
    const response = await this.patientCareService.findPatientCareStaff(
      newPage,
      newLimit,
      city,
      name,
    );
    return this.responseHandler.successHandler(
      response,
      'Patients Care Staff found successfully',
    );
  }

  @Get(':id')
  public async findOne(@Param('id') id: string): Promise<SuccessHandler<any>> {
    const response = await this.patientCareService.findOne(id);
    return this.responseHandler.successHandler(
      response,
      'Patient Care Staff Found Successfully',
    );
  }

  @Patch()
  public async updateProfile(
    @Body() updateDto: UpdatePatientCareDTO,
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user;
    console.log(id, role, 'hit the point');

    if (role !== roles.patientCare) {
      throw new CustomError('you Cannot Update the Patient');
    }
    const response = await this.patientCareService.updateProfile(id, updateDto);
    return this.responseHandler.successHandler(
      response,
      'patient Care Staff profile updated',
    );
  }
}
