import { useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type WhatsAppMessageOptions = {
  orderId: number;
  phoneNumber: string;
  message: string;
};

/**
 * Hook for sending WhatsApp notifications
 */
export function useWhatsApp() {
  const { toast } = useToast();

  const sendMessage = useCallback(
    async ({ orderId, phoneNumber, message }: WhatsAppMessageOptions) => {
      try {
        await apiRequest('POST', '/api/notifications/whatsapp', {
          orderId,
          phoneNumber,
          message,
        });

        toast({
          title: 'تم الإرسال بنجاح',
          description: 'تم إرسال الرسالة بنجاح عبر واتساب',
          variant: 'success',
        });

        return true;
      } catch (error) {
        console.error('Failed to send WhatsApp notification:', error);
        
        toast({
          title: 'خطأ في الإرسال',
          description: 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة مرة أخرى',
          variant: 'destructive',
        });
        
        return false;
      }
    },
    [toast]
  );

  return { sendMessage };
}
