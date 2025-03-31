import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Order } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

interface ConfirmationProps {
  order: Order;
  onNewOrder: () => void;
}

export default function Confirmation({ order, onNewOrder }: ConfirmationProps) {
  const { data: game } = useQuery({
    queryKey: [`/api/games/${order.gameId}`],
  });

  const { data: priceOption } = useQuery({
    queryKey: [`/api/games/${order.gameId}/price-options`],
    select: (data) => data.find((option: any) => option.id === order.priceOptionId),
  });

  const formatDate = (date: string | Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleDateString('ar-EG', options);
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'vodafoneCash': return 'فودافون كاش';
      case 'instaPay': return 'انستا باي';
      case 'bankTransfer': return 'تحويل بنكي';
      default: return method;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <div className="py-6">
        <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white text-3xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-3">تم استلام طلبك بنجاح!</h2>
        <p className="mb-6 text-gray-600">سيتم مراجعة طلبك وتنفيذه في أقرب وقت ممكن. سنرسل لك رسالة تأكيد على رقم هاتفك عند اكتمال العملية.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md mx-auto">
          <div className="text-right">
            <p className="mb-1"><span className="font-medium">رقم الطلب:</span> <span>{order.orderNumber}</span></p>
            <p className="mb-1"><span className="font-medium">التاريخ:</span> <span>{formatDate(order.createdAt)}</span></p>
            <p className="mb-1"><span className="font-medium">اللعبة:</span> <span>{game?.name} - {priceOption?.amount} {priceOption?.currency}</span></p>
            <p className="mb-1"><span className="font-medium">معرف اللاعب:</span> <span>{order.gameAccountId}</span></p>
            {order.serverName && (
              <p className="mb-1"><span className="font-medium">السيرفر:</span> <span>{order.serverName}</span></p>
            )}
            <p className="mb-1"><span className="font-medium">المبلغ:</span> <span className="text-primary font-bold">{order.price} جنيه</span></p>
            <p><span className="font-medium">طريقة الدفع:</span> <span>{getPaymentMethodLabel(order.paymentMethod)}</span></p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <a 
            href="https://wa.me/201xxxxxxxxx?text=استفسار%20بخصوص%20الطلب%20رقم%20" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            تواصل عبر واتساب
          </a>
          <Button 
            onClick={onNewOrder}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            طلب جديد
          </Button>
        </div>
      </div>
    </div>
  );
}
