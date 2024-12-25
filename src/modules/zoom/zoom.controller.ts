import { Controller, Post, Body, HttpException, HttpStatus, Get } from '@nestjs/common';
import { ZoomService } from './zoom.service';
import { SuccessHandler } from 'interfaces/success-handler.interface';

@Controller('zoom')
export class ZoomController {
  constructor(private readonly zoomService: ZoomService) {}

  @Get('create-meeting')
  async createMeeting(): Promise<SuccessHandler<any>> {

    // Create the meeting
    const meetingDetails = await this.zoomService.createMeeting();
    return meetingDetails
  }
}
