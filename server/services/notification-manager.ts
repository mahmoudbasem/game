
import { WhatsAppService } from './whatsapp';
import { EmailService } from './email';
import { SMSService } from './sms';

export class NotificationManager {
  private whatsapp: WhatsAppService;
  private email: EmailService;
  private sms: SMSService;

  constructor(
    whatsappToken: string,
    whatsappPhoneId: string,
    emailConfig: { host: string; port: number; user: string; pass: string },
    smsConfig: { apiKey: string; sender: string }
  ) {
    this.whatsapp = new WhatsAppService(whatsappToken, whatsappPhoneId);
    this.email = new EmailService(
      emailConfig.host,
      emailConfig.port,
      emailConfig.user,
      emailConfig.pass
    );
    this.sms = new SMSService(smsConfig.apiKey, smsConfig.sender);
  }

  async sendOrderStatusNotification(order: any) {
    const message = `مرحباً ${order.customerName}،\nتم تحديث حالة طلبك رقم #${order.orderNumber} إلى "${order.status}"`;
    
    try {
      // إرسال رسالة واتساب
      if (order.customerPhone) {
        await this.whatsapp.sendMessage(order.customerPhone, message);
      }
      
      // إرسال بريد إلكتروني
      if (order.customerEmail) {
        await this.email.sendEmail(
          order.customerEmail,
          `تحديث حالة الطلب #${order.orderNumber}`,
          message
        );
      }
      
      // إرسال رسالة نصية
      if (order.customerPhone) {
        await this.sms.sendSMS(order.customerPhone, message);
      }
    } catch (error) {
      console.error('Notification Error:', error);
      throw error;
    }
  }
}
