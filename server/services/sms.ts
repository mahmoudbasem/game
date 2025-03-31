
import axios from 'axios';

export class SMSService {
  private apiKey: string;
  private sender: string;

  constructor(apiKey: string, sender: string) {
    this.apiKey = apiKey;
    this.sender = sender;
  }

  async sendSMS(to: string, message: string) {
    try {
      const response = await axios.post('YOUR_SMS_PROVIDER_URL', {
        apiKey: this.apiKey,
        sender: this.sender,
        to: to,
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('SMS Service Error:', error);
      throw error;
    }
  }
}
