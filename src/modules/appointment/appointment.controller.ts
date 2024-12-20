import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { SuccessHandler } from 'interfaces/success-handler.interface';
import { BookAppointmentDto } from './DTO/book-appointment.dto';
import { Request } from 'express';
import { roles } from 'enums/role.enum';
import { CustomError } from 'utility/custom-error';
import { ResponseHandler } from 'utility/success-response';
import { log } from 'node:console';
import { stat } from 'node:fs';
import { AppointmentStatus } from 'enums/appointment.enum';
import { UpdateAppointment } from './DTO/update-appointment-details';
@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly responseHandler: ResponseHandler,
  ) { }

  @Post(':hospitalId/:doctorId')
  public async BookAppointment(
    @Body() bookAppointmentDto: BookAppointmentDto,
    @Param('hospitalId') hospitalId: string,
    @Param('doctorId') doctorId: string,
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    console.log('entered', bookAppointmentDto, hospitalId, doctorId);
    const { id, role } = req.user;
    if (role !== roles.patient) {
      throw new CustomError('Only Patients can book the appointments');
    }
    const response = await this.appointmentService.BookAppointment(
      id,
      hospitalId,
      doctorId,
      bookAppointmentDto,
    );
    return this.responseHandler.successHandler(
      true,
      'Thanks for Booked Appointment, you will get a Confirmation Email, Wait for Approval',
    );
  }

  @Get()
  public async findAppointments(
    @Req() req: Request,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('date') date?: string,
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user;
    const newPage = parseInt(page);
    const newLimit = parseInt(limit);
    const newDate = date ? new Date(date) : null;
    console.log(id, role, newPage, newLimit, date, 'Credentialsss');

    const response = await this.appointmentService.findAppointments(
      id,
      role,
      newPage,
      newLimit,
      newDate,
    );
    return this.responseHandler.successHandler(
      response,
      'Appointments Found Successfully',
    );
  }

  @Get(':appointmentId')
  public async findOne(
    @Param('appointmentId') appointmentId: string,
    @Req() req: Request,
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user;
    console.log(id, role, appointmentId, 'Credentialsss');
    const response = await this.appointmentService.findOne(
      id,
      role,
      appointmentId,
    );
    return this.responseHandler.successHandler(
      response,
      'Appointment Found Successfully',
    );
  }


  @Patch(':appointmentId')
  public async updateAppointmentRecord(
    @Req() req: Request,
    @Param('appointmentId') appointmentId: string,
    @Body() updateAppointmentDto?: UpdateAppointment
  ) {
    console.log("Entered");


    const { id, role } = req.user
    console.log("Controller:", id, role, appointmentId)
    if (role !== roles.doctor) {
      throw new CustomError("Only Doctor can Update the Appointment", 402)
    }
    const response = await this.appointmentService.updateAppointmentRecord(id, role, appointmentId, updateAppointmentDto)
    return this.responseHandler.successHandler(response, "Appointment Record updated Successfully")

  }
}
