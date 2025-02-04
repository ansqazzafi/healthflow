import {
  Body,
  Controller,
  Req,
  Query,
  Get,
  Param,
  Delete,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { CustomError } from 'utility/custom-error';
import { ResponseHandler } from 'utility/success-response';
import { Request } from 'express';
import { VerifyAdminGuard } from 'guards/verify-admin.guard';
import { UpdateHospitalDTO } from './DTO/update-hospital.dto';
@Controller('hospital')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly responseHandler: ResponseHandler,
  ) { }


  @Get()
  public async findHospitals(
    @Query('name') name?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('city') city?: string,
  ): Promise<SuccessHandler<any>> {
    const newPage = parseInt(page);
    const newLimit = parseInt(limit);
    const response = await this.hospitalService.getHospitals(
      newPage,
      newLimit,
      city,
      name
    );
    return this.responseHandler.successHandler(
      response,
      'Hospitals fetched Successfully',
    );
  }

  @Get(':id')
  public async findOne(@Param('id') id: string): Promise<SuccessHandler<any>> {
    const response = await this.hospitalService.findOne(id);
    return this.responseHandler.successHandler(
      response,
      'Hospital found successfully',
    );
  }

  @Delete(':id')
  @UseGuards(VerifyAdminGuard)
  public async deleteHospital(
    @Param('id') id: string,
  ): Promise<SuccessHandler<any>> {
    console.log('id', id);
    const response = await this.hospitalService.deleteHospital(id);
    return this.responseHandler.successHandler(
      true,
      'Hospital Deleted Successfully',
    );
  }

  @Patch()
  public async updateProfile(
    @Body() updateDto: UpdateHospitalDTO,
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user;
    console.log("Entered In Updae", id, role);

    if (role !== 'hospital') {
      throw new CustomError('Cannot delete the hospital');
    }
    const response = await this.hospitalService.updateProfile(id, updateDto);
    return this.responseHandler.successHandler(
      response,
      'Hospital profile updated',
    );
  }
}
