import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodemailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(to: string, subject: string, text: string, name: string) {
    const senderName = this.configService.get('SENDER_NAME');
    const senderEmail = this.configService.get('SENDER_EMAIL');

    // HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { padding: 20px; }
            .greeting { color: #3498db; }
            .footer { font-size: 12px; color: #888888; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="greeting">Hello, ${name}!</h1>
            <p>${text}</p>
            <p>Best regards,<br />Healthflow Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Healthflow. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await this.mailerService.sendMail({
        from: `"${senderName}" <${senderEmail}>`,  // Sender email
        to: to,  // Recipient email
        subject: subject,  // Subject of the email
        text: 'This is a plain-text version of the email',  // Optional plain text version
        html: htmlContent,  // HTML version of the email
      });
      console.log("Email sent successfully:", response);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error; // Propagate the error if needed
    }
  }
}
