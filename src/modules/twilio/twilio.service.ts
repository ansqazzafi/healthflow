import { forwardRef, Inject, Injectable } from '@nestjs/common';
import Twilio from 'twilio';
import { CustomError } from 'utility/custom-error';
import * as crypto from 'crypto';  // For generating random verification code
import { ConfigService } from '@nestjs/config'; // To use environment variables
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { Message } from 'twilio/lib/twiml/MessagingResponse';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio.Twilio;
  private verificationCodes: Map<string, { code: string; expiresAt: number }> = new Map();

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService)) private readonly userService: UserService
  ) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    this.twilioClient = Twilio(accountSid, authToken);
  }
  private generateVerificationCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }


  async sendMessage(to: string, message: string): Promise<any> {
    try {
      const response = await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to,
        
      });
      if (!response) {
        throw new CustomError("Unable to send message", 401)
      }
      return response

    } catch (error) {
      console.log(error, "error");
      
      if (error instanceof CustomError) {
        throw error
      }
      throw new CustomError("Error to sending message", 402)
    }
  }

  async sendVerificationSms(to: string, Message: string): Promise<string> {
    try {
      const verificationCode = this.generateVerificationCode();
      const message = `${Message} ${verificationCode}`;
      const response = await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to,
      });
      this.verificationCodes.set(to, { code: verificationCode, expiresAt: Date.now() + 10 * 60 * 1000 });
      return verificationCode;
    } catch (error) {
      console.error('Error during sending SMS:', error);
      throw new CustomError('Failed to send verification SMS to receiver', 404);
    }
  }
  async verifyCode(phoneNumber: string, code: string): Promise<boolean> {
    const record = this.verificationCodes.get(phoneNumber);

    if (!record) {
      throw new CustomError('Verification record not found', 404);
    }
    if (record.code === code && record.expiresAt > Date.now()) {
      this.verificationCodes.delete(phoneNumber);
      return true
    } else {
      throw new CustomError('Invalid or expired verification code', 400);
    }
  }
}
