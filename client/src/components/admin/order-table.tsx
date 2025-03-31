import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Order } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWhatsApp } from '@/hooks/use-whatsapp';
import { useToast } from '@/hooks/use-toast';

export default function OrderTable() {
  const { data: orders, isLoading } = useQuery({ 
    queryKey: ['/api/orders'],
  });
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  
  const { toast } = useToast();
  const { sendMessage } = useWhatsApp();

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => {
      const [orderStatus, paymentStatus] = status.split('_');
      return apiRequest('PATCH', `/api/orders/${id}/status`, {
        orderStatus,
        paymentStatus
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setStatusDialogOpen(false);
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث حالة الطلب بنجاح',
        variant: 'success',
      });
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث حالة الطلب',
        variant: 'destructive',
      });
    }
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    const order = orders.find((o: Order) => o.id === orderId);
    setSelectedOrder(order);
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleWhatsAppSend = async () => {
    if (!selectedOrder) return;
    
    const success = await sendMessage({
      orderId: selectedOrder.id,
      phoneNumber: selectedOrder.customerPhone,
      message: whatsappMessage
    });
    
    if (success) {
      setWhatsappDialogOpen(false);
      setWhatsappMessage('');
    }
  };

  const openWhatsAppDialog = (order: Order) => {
    setSelectedOrder(order);
    setWhatsappMessage(
      `مرحباً، بخصوص طلبك رقم ${order.orderNumber} في GameCharge. `
    );
    setWhatsappDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">قيد الانتظار</Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">مكتمل</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">قيد الانتظار</Badge>;
      case 'paid':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">مدفوع</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">فشل الدفع</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500">لا توجد طلبات حتى الآن</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الطلب</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>معرف اللاعب</TableHead>
            <TableHead>المبلغ</TableHead>
            <TableHead>حالة الطلب</TableHead>
            <TableHead>حالة الدفع</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order: Order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>{formatDate(order.createdAt)}</TableCell>
              <TableCell>{order.gameAccountId}</TableCell>
              <TableCell>{order.price} ج.م.</TableCell>
              <TableCell>{getOrderStatusBadge(order.orderStatus)}</TableCell>
              <TableCell>{getPaymentStatusBadge(order.paymentStatus)}</TableCell>
              <TableCell>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Select
                    value={`${order.orderStatus}_${order.paymentStatus}`}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="تغيير الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_pending">قيد الانتظار</SelectItem>
                      <SelectItem value="processing_pending">قيد التنفيذ</SelectItem>
                      <SelectItem value="processing_paid">قيد التنفيذ - مدفوع</SelectItem>
                      <SelectItem value="completed_paid">مكتمل - مدفوع</SelectItem>
                      <SelectItem value="cancelled_failed">ملغي - فشل الدفع</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openWhatsAppDialog(order)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    ارسال
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* WhatsApp Message Dialog */}
      <AlertDialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>إرسال رسالة واتساب</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-2">إرسال رسالة إلى الرقم: {selectedOrder?.customerPhone}</p>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleWhatsAppSend}>إرسال</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
