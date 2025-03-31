import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { Game, PriceOption } from '@shared/schema';

interface AccountInfoProps {
  selectedGame: Game;
  onPrevious: () => void;
  onNext: (formData: AccountFormData) => void;
}

export type AccountFormData = {
  gameAccountId: string;
  serverName?: string;
  priceOptionId: number;
  customerPhone: string;
  notes?: string;
};

const accountFormSchema = z.object({
  gameAccountId: z.string().min(1, { message: 'رقم اللاعب مطلوب' }),
  serverName: z.string().optional(),
  priceOptionId: z.number().min(1, { message: 'يرجى اختيار فئة الشحن' }),
  customerPhone: z.string().regex(/^01[0-9]{9}$/, { message: 'رقم الهاتف غير صحيح' }),
  notes: z.string().optional(),
});

export default function AccountInfo({ selectedGame, onPrevious, onNext }: AccountInfoProps) {
  const { data: priceOptions, isLoading } = useQuery({
    queryKey: [`/api/games/${selectedGame?.id}/price-options`],
    enabled: !!selectedGame,
  });

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      gameAccountId: '',
      serverName: '',
      priceOptionId: 0,
      customerPhone: '',
      notes: '',
    }
  });

  const onSubmit = (data: AccountFormData) => {
    onNext(data);
  };

  // Reset form when game changes
  useEffect(() => {
    form.reset({
      gameAccountId: '',
      serverName: '',
      priceOptionId: 0,
      customerPhone: '',
      notes: '',
    });
  }, [selectedGame, form]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center">أدخل بيانات الحساب</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl mx-auto space-y-4">
          <FormField
            control={form.control}
            name="gameAccountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">
                  رقم اللاعب أو معرف الحساب <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="أدخل رقم اللاعب أو ID الخاص بك" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="serverName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">
                  السيرفر (إن وجد)
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="أدخل رقم السيرفر (اختياري)" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priceOptionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">
                  الفئة المطلوبة <span className="text-red-500">*</span>
                </FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {isLoading ? (
                    <div className="col-span-full text-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : (
                    priceOptions?.map((option: PriceOption) => (
                      <div key={option.id} className="relative">
                        <input 
                          type="radio" 
                          id={`amount-${option.id}`} 
                          className="sr-only peer" 
                          checked={field.value === option.id}
                          onChange={() => field.onChange(option.id)}
                        />
                        <label 
                          htmlFor={`amount-${option.id}`} 
                          className="block text-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:border-primary peer-checked:border-primary peer-checked:bg-primary-light/10"
                        >
                          <span className="block font-gaming">{option.amount} {option.currency}</span>
                          <span className="block font-bold text-primary">{option.price} جنيه</span>
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <FormMessage className="text-red-500 mt-2" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">
                  رقم الهاتف <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    type="tel" 
                    placeholder="أدخل رقم الهاتف للتواصل وإرسال التأكيد" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-gray-700 font-medium mb-2">
                  ملاحظات (اختياري)
                </FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="أي ملاحظات إضافية تريد إضافتها" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={onPrevious}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              السابق
            </Button>
            <Button
              type="submit"
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              التالي
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
