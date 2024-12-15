import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
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
@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly responseHandler: ResponseHandler,
  ) {}

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
      'Appointment Booked Successfully, wait for Approval',
    );
  }

  @Patch(':appointmentId/:status')
  public async updateAppointment(
    @Req() req: Request,
    @Param('appointmentId') appointmentId: string,
    @Param('status') status: AppointmentStatus,
    @Body() Body?: { cancelledReason: string },
  ): Promise<SuccessHandler<any>> {
    const { id, role } = req.user;
    let reason = '';
    if (Body && Body.cancelledReason) {
      reason = Body.cancelledReason;
    }
    if (role !== roles.doctor && role !== roles.patient) {
      throw new CustomError(
        'You are not authorized to update the appointment',
        401,
      );
    }

    if (role === roles.patient && status !== AppointmentStatus.CANCELLED) {
      throw new CustomError('Patients can only cancel appointments', 403);
    }

    const validStatuses = [
      AppointmentStatus.PENDING,
      AppointmentStatus.CANCELLED,
      AppointmentStatus.APPROVED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.MISSED,
    ];

    if (!validStatuses.includes(status)) {
      throw new CustomError('Invalid status transition', 400);
    }
    const response = await this.appointmentService.updateAppointment(
      id,
      role,
      appointmentId,
      status,
      reason,
    );

    return this.responseHandler.successHandler(
      true,
      `Appointment ${status} successfully`,
    );
  }
}
