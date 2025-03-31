import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { AccountFormData } from './account-info';
import { Game, PriceOption } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethodProps {
  selectedGame: Game;
  priceOption: PriceOption;
  accountData: AccountFormData;
  onPrevious: () => void;
  onSuccess: (orderData: any) => void;
}

type PaymentMethod = 'vodafoneCash' | 'instaPay' | 'bankTransfer';

export default function PaymentMethod({ 
  selectedGame, 
  priceOption, 
  accountData, 
  onPrevious,
  onSuccess
}: PaymentMethodProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafoneCash');
  const { toast } = useToast();

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest('POST', '/api/orders', data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      onSuccess(data);
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: 'تم إنشاء الطلب بنجاح',
        description: 'سيتم مراجعة طلبك وتنفيذه في أقرب وقت',
        variant: 'success',
      });
    },
    onError: (error) => {
      console.error('Payment error:', error);
      toast({
        title: 'خطأ في عملية الدفع',
        description: 'حدث خطأ أثناء إنشاء الطلب، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  });

  const handleConfirmPayment = () => {
    createOrderMutation.mutate({
      gameId: selectedGame.id,
      priceOptionId: priceOption.id,
      gameAccountId: accountData.gameAccountId,
      serverName: accountData.serverName || null,
      customerPhone: accountData.customerPhone,
      notes: accountData.notes || null,
      amount: priceOption.amount,
      price: priceOption.price,
      paymentMethod
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center">اختر طريقة الدفع</h2>
      
      <div className="max-w-xl mx-auto">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold">ملخص الطلب</h3>
              <p className="text-gray-600">{selectedGame.name} - {priceOption.amount} {priceOption.currency}</p>
              <p className="text-gray-600">معرف اللاعب: {accountData.gameAccountId}</p>
              {accountData.serverName && (
                <p className="text-gray-600">السيرفر: {accountData.serverName}</p>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">المبلغ</p>
              <p className="text-2xl font-bold text-primary">{priceOption.price} جنيه</p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            اختر وسيلة الدفع
          </label>
          
          <div className="space-y-3">
            <div className="payment-method relative">
              <input 
                type="radio" 
                id="vodafoneCash" 
                name="paymentMethod" 
                value="vodafoneCash"
                onChange={() => setPaymentMethod('vodafoneCash')}
                checked={paymentMethod === 'vodafoneCash'}
                className="sr-only" 
              />
              <label 
                htmlFor="vodafoneCash" 
                className={`flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary ${
                  paymentMethod === 'vodafoneCash' ? 'border-primary bg-primary-light/10' : 'border-gray-300'
                }`}
              >
                <div className="h-10 w-10 bg-red-600 rounded flex items-center justify-center text-white ml-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-medium">فودافون كاش</span>
                  <span className="text-sm text-gray-500">الدفع عبر محفظة فودافون كاش</span>
                </div>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'vodafoneCash' ? 'border-primary' : 'border-gray-300'
                  }`}>
                    <div className={`h-3 w-3 rounded-full ${
                      paymentMethod === 'vodafoneCash' ? 'bg-primary' : 'bg-transparent'
                    }`}></div>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="payment-method relative">
              <input 
                type="radio" 
                id="instaPay" 
                name="paymentMethod"
                value="instaPay"
                onChange={() => setPaymentMethod('instaPay')}
                checked={paymentMethod === 'instaPay'}
                className="sr-only" 
              />
              <label 
                htmlFor="instaPay" 
                className={`flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary ${
                  paymentMethod === 'instaPay' ? 'border-primary bg-primary-light/10' : 'border-gray-300'
                }`}
              >
                <div className="h-10 w-10 bg-blue-600 rounded flex items-center justify-center text-white ml-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-medium">انستا باي</span>
                  <span className="text-sm text-gray-500">الدفع عبر بوابة انستا باي</span>
                </div>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'instaPay' ? 'border-primary' : 'border-gray-300'
                  }`}>
                    <div className={`h-3 w-3 rounded-full ${
                      paymentMethod === 'instaPay' ? 'bg-primary' : 'bg-transparent'
                    }`}></div>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="payment-method relative">
              <input 
                type="radio" 
                id="bankTransfer" 
                name="paymentMethod"
                value="bankTransfer"
                onChange={() => setPaymentMethod('bankTransfer')}
                checked={paymentMethod === 'bankTransfer'}
                className="sr-only" 
              />
              <label 
                htmlFor="bankTransfer" 
                className={`flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary ${
                  paymentMethod === 'bankTransfer' ? 'border-primary bg-primary-light/10' : 'border-gray-300'
                }`}
              >
                <div className="h-10 w-10 bg-green-600 rounded flex items-center justify-center text-white ml-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <div>
                  <span className="block font-medium">تحويل بنكي</span>
                  <span className="text-sm text-gray-500">تحويل مباشر إلى الحساب البنكي</span>
                </div>
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'bankTransfer' ? 'border-primary' : 'border-gray-300'
                  }`}>
                    <div className={`h-3 w-3 rounded-full ${
                      paymentMethod === 'bankTransfer' ? 'bg-primary' : 'bg-transparent'
                    }`}></div>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-bold mb-3">تفاصيل الدفع</h3>
          
          {paymentMethod === 'vodafoneCash' && (
            <div>
              <p className="mb-2"><span className="font-medium">رقم المحفظة:</span> 01xxxxxxxxx</p>
              <p className="mb-2"><span className="font-medium">اسم صاحب المحفظة:</span> محمد أحمد</p>
              <p className="text-sm text-gray-600">بعد إتمام التحويل، اضغط على زر التأكيد أدناه ليتم مراجعة طلبك وتنفيذه.</p>
            </div>
          )}
          
          {paymentMethod === 'instaPay' && (
            <div>
              <p className="mb-2"><span className="font-medium">رابط الدفع:</span> سيتم تحويلك لبوابة الدفع بعد تأكيد الطلب</p>
              <p className="text-sm text-gray-600">اضغط على "تأكيد الدفع" وسيتم تحويلك إلى صفحة الدفع الآمنة.</p>
            </div>
          )}
          
          {paymentMethod === 'bankTransfer' && (
            <div>
              <p className="mb-2"><span className="font-medium">اسم البنك:</span> بنك مصر</p>
              <p className="mb-2"><span className="font-medium">رقم الحساب:</span> xxxx-xxxx-xxxx-xxxx</p>
              <p className="mb-2"><span className="font-medium">اسم صاحب الحساب:</span> محمد أحمد</p>
              <p className="text-sm text-gray-600">بعد إتمام التحويل، اضغط على زر التأكيد أدناه ليتم مراجعة طلبك وتنفيذه.</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            onClick={onPrevious}
            disabled={createOrderMutation.isPending}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            السابق
          </Button>
          <Button
            type="button"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            onClick={handleConfirmPayment}
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري التأكيد...
              </>
            ) : (
              <>
                تأكيد الدفع
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
