
import axios from 'axios';

export class WhatsAppService {
  private token: string;
  private phoneNumberId: string;

  constructor(token: string, phoneNumberId: string) {
    this.token = token;
    this.phoneNumberId = phoneNumberId;
  }

  async sendMessage(to: string, message: string) {
    try {
      const response = await axios.post(
        `https://graph.facebook.com/v17.0/${this.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: to,
          type: "text",
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('WhatsApp API Error:', error);
      throw error;
    }
  }
}
