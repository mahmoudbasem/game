import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import AdminLayout from "@/components/layouts/admin-layout";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Icons
import {
  ShoppingCart,
  Users,
  CreditCard,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";

export default function AdminDashboard() {
  // Fetch orders for statistics
  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    queryFn: getQueryFn<any[]>({
      on401: "returnNull",
    }),
  });

  // Calculate statistics
  const pendingOrders = orders.filter(
    (order: any) => order.orderStatus === "pending"
  ).length;
  
  const completedOrders = orders.filter(
    (order: any) => order.orderStatus === "completed"
  ).length;
  
  const totalRevenue = orders
    .filter((order: any) => order.paymentStatus === "paid")
    .reduce((sum: number, order: any) => sum + order.price, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get today's date in Arabic
  const today = new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-1">لوحة المعلومات</h1>
          <p className="text-muted-foreground text-sm">{today}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                طلب في القاعدة
              </p>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">طلبات معلقة</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                بانتظار المعالجة
              </p>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">طلبات مكتملة</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                تم تنفيذها بنجاح
              </p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                من الطلبات المدفوعة
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Orders */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>آخر الطلبات</CardTitle>
              <CardDescription>
                أحدث 5 طلبات وردت إلى النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  لا توجد طلبات حتى الآن
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div>
                        <div className="font-medium">طلب #{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`text-sm rounded-full px-3 py-1 
                            ${order.orderStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : order.orderStatus === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`
                          }
                        >
                          {order.orderStatus === 'completed' 
                            ? 'مكتمل' 
                            : order.orderStatus === 'pending' 
                              ? 'معلق' 
                              : order.orderStatus
                          }
                        </div>
                        <div 
                          className={`text-sm rounded-full px-3 py-1 
                            ${order.paymentStatus === 'paid' 
                              ? 'bg-blue-100 text-blue-800' 
                              : order.paymentStatus === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                            }`
                          }
                        >
                          {order.paymentStatus === 'paid' 
                            ? 'مدفوع' 
                            : order.paymentStatus === 'pending' 
                              ? 'انتظار الدفع' 
                              : 'غير مدفوع'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>
                وصول سريع لأهم الإجراءات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col space-y-3">
                  <a
                    href="/admin/orders"
                    className="flex items-center p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <ShoppingCart className="ml-2 h-5 w-5" />
                    <span>إدارة الطلبات</span>
                  </a>
                  <a
                    href="/admin/games"
                    className="flex items-center p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Calendar className="ml-2 h-5 w-5" />
                    <span>إدارة الألعاب</span>
                  </a>
                  <a
                    href="/admin/users"
                    className="flex items-center p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Users className="ml-2 h-5 w-5" />
                    <span>إدارة العملاء</span>
                  </a>
                  <a
                    href="/admin/admins"
                    className="flex items-center p-3 bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Users className="ml-2 h-5 w-5" />
                    <span>إدارة المسؤولين</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}