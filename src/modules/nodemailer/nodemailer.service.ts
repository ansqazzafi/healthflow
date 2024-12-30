import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NodemailerService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) { }


  async sendMail(to: string, subject: string, text: string, name: string, paymentLink?: string, zoomLink?:string) {
    const senderName = this.configService.get('SENDER_NAME');
    const senderEmail = this.configService.get('SENDER_EMAIL');
    let paymentSection = '';
    let zoomSection = '';
    if (paymentLink) {
      paymentSection = `
            <p>Click the link below to make the payment:</p>
            <p>${paymentLink}</p>
        `;
    }
    if (zoomLink) {
      zoomSection = `
      <p>Here is the link to join the meeting on Mentioned Date</p>
      <p>${zoomLink}</p>
  `;
    }

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
            ${paymentSection}  <!-- This part will conditionally include the payment link -->
            ${zoomSection}  <!-- This part will conditionally include the payment link -->
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
        from: `"${senderName}" <${senderEmail}>`,
        to: to,
        subject: subject,
        text: 'This is a plain-text version of the email',
        html: htmlContent,
      });
      console.log("Email sent successfully:", response);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error; // Propagate the error if needed
    }
  }
}


