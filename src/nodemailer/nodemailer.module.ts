import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MailerModule.forRootAsync({
          useFactory: (configService: ConfigService) => ({
            transport: {
              host: configService.get('SMTP_HOST'),  // 'in-v3.mailjet.com'
              port: parseInt(configService.get('SMTP_PORT')),  // 587
              secure: configService.get('SMTP_SECURE') === 'true',  // false for port 587 (STARTTLS)
              auth: {
                user: configService.get('API_KEY'),  // Your Mailjet API Key
                pass: configService.get('SECRET_KEY'),  // Your Mailjet Secret Key
              },
            },
          }),
          inject: [ConfigService],
        }),
      ],
      providers: [NodemailerService],
      exports: [NodemailerService],
})
export class NodemailerModule { }
