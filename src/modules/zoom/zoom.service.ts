import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

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
      throw new HttpException(
        'Failed to get Zoom access token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async createMeeting(): Promise<any> {
    const token = await this.getAccessToken();
    console.log(token, "TOken are here")
    const url = `https://api.zoom.us/v2/users/meetings`;

    try {
      const response = await axios.post(
        url,
        {
          topic:"Online Consultation",
          type: 2,
          start_time: '2024-12-31T10:00:00Z', // Format: YYYY-MM-DDTHH:mm:ssZ
          duration:60, // In minutes
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

      return response

     
    } catch (error) {
      throw new HttpException(
        'Failed to create Zoom meeting',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
