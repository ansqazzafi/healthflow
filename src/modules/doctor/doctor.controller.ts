import {
  Get,
  Body,
  Controller,
  Post,
  Req,
  UsePipes,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { RegisterDto } from 'DTO/register.dto';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { HashPasswordPipe } from 'pipes/hash-password.pipe';
import { CustomError } from 'utility/custom-error';
import { DoctorService } from './doctor.service';
import { ResponseHandler } from 'utility/success-response';
import { Request } from 'express';
import { UpdateDoctorDTO } from './DTO/update-doctor.dto';
import { roles } from 'enums/role.enum';
@Controller('doctor')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly responseHandler: ResponseHandler,
  ) { }

  @Post()
  public async registerDoctor(
    @Body() RegisterDto: RegisterDto,
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    const { id } = req.user;
    RegisterDto.doctor.hospital = id;
    if (req.user.role !== 'hospital') {
      throw new CustomError('You cannot register Doctor');
    }
    try {
      const response = await this.doctorService.register(RegisterDto, id);
      if (!response) {
        throw new CustomError('Unable to Registered the Doctor', 401);
      }
      return this.responseHandler.successHandler(
        true,
        'Doctor registered SuccessFully',
      );
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError('There is an error during register doctor', 402);
    }
  }

  @Get()
  public async findDoctors(
    @Req() req:Request,
    @Query('name') name?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('city') city?: string,
    @Query('specialty') specialty?: string,
    @Query('hospitalId') hospitalId?: string,
    @Query('avaliablity') availablity?: string,
  ): Promise<SuccessHandler<any>> {
    const {role} = req.user
    console.log(page, limit, specialty, city, hospitalId);
    const newPage = parseInt(page, 10);
    const newLimit = parseInt(limit, 10);
    const response = await this.doctorService.findDoctors(
      newPage,
      newLimit,
      role,
      city,
      specialty,
      hospitalId,
      availablity,
      name
    );
    return this.responseHandler.successHandler(
      response,
      'Doctor found successfully',
    );
  }

  @Get(':id')
  public async findOne(@Param('id') id: string): Promise<SuccessHandler<any>> {
    const response = await this.doctorService.findOne(id);
    return this.responseHandler.successHandler(
      response,
      'Doctor Found Successfully',
    );
  }
  @Patch()
  public async updateProfile(
    @Body() updateDto: UpdateDoctorDTO,
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user;
    console.log(id, role, "hit the point");

    if (role !== 'doctor') {
      throw new CustomError('Cannot update the doctor');
    }
    const response = await this.doctorService.updateDoctorProfile(
      id,
      updateDto,
    );
    return this.responseHandler.successHandler(
      response,
      'Doctor profile updated',
    );

  }

  @Delete(':doctorId')
  public async deleteDoctor(
    @Req() req: Request,
    @Param('doctorId') doctorId: string
  ): Promise<SuccessHandler<any>> {
    console.log("True")
    const { id, role } = req.user
    if (role !== roles.hospital) {
      throw new CustomError("Only Hospital who hired this Doctor")
    }
    const response = await this.doctorService.deleteDoctor(id, doctorId)
    return this.responseHandler.successHandler(true, "Doctor deleted from your Hospital")
  }
}
