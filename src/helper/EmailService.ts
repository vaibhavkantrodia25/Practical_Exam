import * as nodemailer from 'nodemailer';

export class EmailService {
  static async sendEmail(to: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: 'Password reset link',
    };
  }
}
