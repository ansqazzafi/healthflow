import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import { CustomError } from 'utility/custom-error';

@Injectable()
export class ZoomService {
  private async getAccessToken(): Promise<string> {
    const url = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`;
    const authHeader = Buffer.from(
      `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`,
    ).toString('base64');

    try {
      const response = await axios.post(url, null, {
        headers: {
          Authorization: `Basic ${authHeader}`,
        },
      });
      return response.data.access_token;
    } catch (error) {
      throw new CustomError(
        'Failed to get Zoom access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async createMeeting(appointmentDate): Promise<any> {
    const token = await this.getAccessToken();
    console.log(token, "Token is here");
    const url = `https://api.zoom.us/v2/users/me/meetings`;
    try {
      const response = await axios.post(
        url,
        {
          topic: "Online Consultation",
          type: 2,
          start_time: appointmentDate,
          duration: 60,
          settings: {
            host_video: true,
            participant_video: true,
            waiting_room: true,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const responseData = {
        id: response.data.id,
        password: response.data.password,
        join_url: response.data.join_url
      }

      return responseData;
    } catch (error) {
      console.error(error);
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(
        'Failed to create Zoom meeting',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}




