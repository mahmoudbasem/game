import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CreditCard,
  DollarSign,
  Users,
  Package
} from 'lucide-react';
import { Order } from '@shared/schema';

export default function DashboardStats() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="bg-gray-200 h-4 w-20 rounded"></CardTitle>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-200 h-8 w-16 rounded mb-1"></div>
              <div className="bg-gray-200 h-4 w-24 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const calculateStats = () => {
    if (!orders || !orders.length) {
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0
      };
    }

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((order: Order) => order.orderStatus === 'pending').length;
    const completedOrders = orders.filter((order: Order) => order.orderStatus === 'completed').length;
    const totalRevenue = orders
      .filter((order: Order) => order.paymentStatus === 'paid')
      .reduce((sum: number, order: Order) => sum + order.price, 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue
    };
  };

  const stats = calculateStats();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            منها {stats.completedOrders} مكتمل و {stats.pendingOrders} قيد الانتظار
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRevenue} ج.م.</div>
          <p className="text-xs text-muted-foreground">
            من {stats.completedOrders} طلب مكتمل
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">الطلبات المعلقة</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            بحاجة للمراجعة والتنفيذ
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">متوسط القيمة</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalOrders ? Math.round(stats.totalRevenue / stats.completedOrders) : 0} ج.م.
          </div>
          <p className="text-xs text-muted-foreground">
            متوسط قيمة الطلب
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
