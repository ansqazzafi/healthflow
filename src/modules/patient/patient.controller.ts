import {
  Controller,
  Query,
  Get,
  Param,
  Patch,
  Body,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { ResponseHandler } from 'utility/success-response';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { UpdatePatientDTO } from './DTO/updateDto';
import { CustomError } from 'utility/custom-error';
import { Request } from 'express';
import { VerifyAdminGuard } from 'guards/verify-admin.guard';
@Controller('patient')
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
    private readonly responseHandler: ResponseHandler,
  ) { }

  @Get()
  @UseGuards(VerifyAdminGuard)
  public async findPatients(
    @Query('name') name?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('city') city?: string,
  ): Promise<SuccessHandler<any>> {
    console.log('entered');
    console.log(page, limit, city);
    const newPage = parseInt(page, 10);
    const newLimit = parseInt(limit, 10);
    const response = await this.patientService.findPatients(
      newPage,
      newLimit,
      city,
      name,
    );
    return this.responseHandler.successHandler(
      response,
      'Patients found successfully',
    );
  }

  @Get(':id')
  @UseGuards(VerifyAdminGuard)
  public async findOne(@Param('id') id: string): Promise<SuccessHandler<any>> {
    const response = await this.patientService.findOne(id);
    return this.responseHandler.successHandler(
      response,
      'Patient Found Successfully',
    );
  }

  @Patch()
  public async updateProfile(
    @Body() updateDto: UpdatePatientDTO,
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user;
    console.log(id, role, 'hit the point');

    if (role !== 'patient') {
      throw new CustomError('you Cannot Update the Patient');
    }
    const response = await this.patientService.updateProfile(id, updateDto);
    return this.responseHandler.successHandler(
      response,
      'patient profile updated',
    );
  }


  @Delete()
  public async deleteProfile(
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user
    console.log("Entered :", id, role)
    const response = await this.patientService.deletePatient(id, role)
    return this.responseHandler.successHandler(true, "Patient Deleted Successfully")
  }



}
