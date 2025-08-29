import { BadRequestException, Injectable } from '@nestjs/common';

import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailerService {
  constructor() {
    sgMail.setApiKey(process.env.SEND_GRID_API_KEY || '');
  }

  async sendEmail(to: string, subject: string, text: string, html?: string) {
    console.log(process.env.SEND_GRID_API_KEY, process.env.SENDER_EMAIL);
    const msg = {
      to,
      from: process.env.SENDER_EMAIL || 'senderEmail@example.com',
      subject,
      text,
      html,
    };

    try {
      await sgMail.send(msg);
      return { message: 'Email sent successfully' };
    } catch (error) {
      console.log('Error sending email:', error);
      throw new BadRequestException('Failed to send email');
    }
  }
}
