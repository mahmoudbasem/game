
import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(host: string, port: number, user: string, pass: string) {
    this.transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: true,
      auth: {
        user: user,
        pass: pass
      }
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      const result = await this.transporter.sendMail({
        from: this.transporter.options.auth?.user,
        to: to,
        subject: subject,
        text: text
      });
      return result;
    } catch (error) {
      console.error('Email Service Error:', error);
      throw error;
    }
  }
}
