import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/layouts/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { useWhatsApp } from "@/hooks/use-whatsapp";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  Filter,
  ArrowDownUp,
  MessageSquare,
  Send,
  Eye,
  Search,
} from "lucide-react";

export default function OrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { sendMessage } = useWhatsApp();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("dateDesc");
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const [openWhatsApp, setOpenWhatsApp] = useState(false);

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    queryFn: getQueryFn<any[]>({
      on401: "throw",
    }),
  });

  // Fetch all games for filtering
  const { data: games = [] } = useQuery<any[]>({
    queryKey: ["/api/games"],
    queryFn: getQueryFn<any[]>({
      on401: "returnNull",
    }),
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      orderStatus,
      paymentStatus,
    }: {
      orderId: number;
      orderStatus?: string;
      paymentStatus?: string;
    }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/orders/${orderId}/status`,
        {
          orderStatus,
          paymentStatus,
        }
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم تحديث حالة الطلب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في تحديث حالة الطلب",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  // WhatsApp notification mutation
  const sendWhatsAppMutation = useMutation({
    mutationFn: ({ orderId, phoneNumber, message }: { orderId: number; phoneNumber: string; message: string }) => {
      return sendMessage({ orderId, phoneNumber, message });
    },
    onSuccess: () => {
      toast({
        title: "تم إرسال الإشعار بنجاح",
        description: "تم إرسال رسالة WhatsApp إلى العميل",
      });
      setOpenWhatsApp(false);
    },
    onError: (error) => {
      toast({
        title: "خطأ في إرسال الإشعار",
        description: error instanceof Error ? error.message : "حدث خطأ في إرسال رسالة WhatsApp",
        variant: "destructive",
      });
    },
  });

  // Handle order status change
  const handleStatusChange = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({
      orderId,
      orderStatus: status,
    });
  };

  // Handle payment status change
  const handlePaymentStatusChange = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({
      orderId,
      paymentStatus: status,
    });
  };

  // Open WhatsApp dialog
  const openWhatsAppDialog = (order: any) => {
    setSelectedOrderId(order.id);
    // Default message template
    setWhatsAppMessage(
      `مرحباً ${order.customerName}! طلبك رقم #${order.orderNumber} ${
        order.orderStatus === "completed" ? "تم تنفيذه بنجاح" : "قيد المعالجة حالياً"
      }. شكراً لاستخدامك خدماتنا.`
    );
    setOpenWhatsApp(true);
  };

  // Send WhatsApp message
  const handleSendWhatsApp = () => {
    if (!selectedOrderId) return;
    
    const order = orders.find((o) => o.id === selectedOrderId);
    if (!order) return;
    
    sendWhatsAppMutation.mutate({
      orderId: order.id,
      phoneNumber: order.customerPhone,
      message: whatsAppMessage,
    });
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter((order) => {
      // Status filter
      if (statusFilter && order.orderStatus !== statusFilter) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.orderNumber.toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.customerPhone.toLowerCase().includes(searchLower) ||
          order.gameAccountId.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort
      switch (sortBy) {
        case "dateAsc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "dateDesc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Format date
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث عن طلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-9 w-full md:w-[200px]"
              />
            </div>
            
            <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <div className="flex items-center">
                  <Filter className="ml-2 h-4 w-4" />
                  {statusFilter ? statusFilter : "جميع الحالات"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="processing">قيد المعالجة</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[150px]">
                <div className="flex items-center">
                  <ArrowDownUp className="ml-2 h-4 w-4" />
                  {sortBy === "dateDesc"
                    ? "الأحدث أولاً"
                    : sortBy === "dateAsc"
                    ? "الأقدم أولاً"
                    : sortBy === "priceDesc"
                    ? "الأعلى سعراً"
                    : "الأقل سعراً"}
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateDesc">الأحدث أولاً</SelectItem>
                <SelectItem value="dateAsc">الأقدم أولاً</SelectItem>
                <SelectItem value="priceDesc">الأعلى سعراً</SelectItem>
                <SelectItem value="priceAsc">الأقل سعراً</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Order Count Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">إجمالي الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">قيد الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((order) => order.orderStatus === "pending").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">مكتملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.filter((order) => order.orderStatus === "completed").length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">إجمالي المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  orders
                    .filter((order) => order.paymentStatus === "paid")
                    .reduce((sum, order) => sum + order.price, 0)
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">اللعبة</TableHead>
                <TableHead className="text-right">معرف الحساب</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">حالة الطلب</TableHead>
                <TableHead className="text-right">حالة الدفع</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10">
                    لا توجد طلبات متطابقة مع معايير البحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.orderNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.customerPhone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {games.find((game) => game.id === order.gameId)?.name || order.gameId}
                    </TableCell>
                    <TableCell>{order.gameAccountId}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(order.price)}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.orderStatus}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue>
                            <Badge
                              className={
                                order.orderStatus === "completed"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : order.orderStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : order.orderStatus === "processing"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {order.orderStatus === "completed"
                                ? "مكتمل"
                                : order.orderStatus === "pending"
                                ? "معلق"
                                : order.orderStatus === "processing"
                                ? "قيد المعالجة"
                                : "ملغي"}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">معلق</SelectItem>
                          <SelectItem value="processing">قيد المعالجة</SelectItem>
                          <SelectItem value="completed">مكتمل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        defaultValue={order.paymentStatus}
                        onValueChange={(value) => handlePaymentStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue>
                            <Badge
                              className={
                                order.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : order.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                  : "bg-red-100 text-red-800 hover:bg-red-100"
                              }
                            >
                              {order.paymentStatus === "paid"
                                ? "مدفوع"
                                : order.paymentStatus === "pending"
                                ? "معلق"
                                : "غير مدفوع"}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="paid">مدفوع</SelectItem>
                          <SelectItem value="pending">معلق</SelectItem>
                          <SelectItem value="unpaid">غير مدفوع</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center space-x-2">
                        <Dialog open={openWhatsApp && selectedOrderId === order.id} onOpenChange={(open) => {
                          if (!open) setOpenWhatsApp(false);
                        }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openWhatsAppDialog(order)}
                            >
                              <MessageSquare className="h-4 w-4 ml-1" />
                              إشعار
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>إرسال إشعار للعميل</DialogTitle>
                              <DialogDescription>
                                سيتم إرسال رسالة واتساب للعميل على الرقم{" "}
                                {order.customerPhone}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <Textarea
                                value={whatsAppMessage}
                                onChange={(e) => setWhatsAppMessage(e.target.value)}
                                rows={5}
                                placeholder="اكتب نص الرسالة هنا..."
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                type="submit"
                                onClick={handleSendWhatsApp}
                                disabled={sendWhatsAppMutation.isPending}
                                className="gap-2"
                              >
                                <Send className="h-4 w-4" />
                                {sendWhatsAppMutation.isPending ? "جاري الإرسال..." : "إرسال"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}