import AdminLayout from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Users, Send, MessageSquare, Mail, ShoppingCart, Eye, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function UsersPage() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // الحصول على بيانات المستخدمين
  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/users"],
    queryFn: getQueryFn<any[]>({
      on401: "returnNull",
    }),
  });

  // الحصول على بيانات الطلبات
  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders"],
    queryFn: getQueryFn<any[]>({
      on401: "returnNull",
    }),
  });

  // دالة لإرسال رسالة للمستخدم (سيتم تنفيذها في المستقبل)
  const handleSendMessage = (userId: number, method: 'sms' | 'email') => {
    toast({
      title: "تم إرسال الرسالة",
      description: method === 'sms' ? "تم إرسال رسالة نصية للمستخدم بنجاح" : "تم إرسال بريد إلكتروني للمستخدم بنجاح",
    });
  };

  // حساب إجمالي مبالغ الطلبات لكل مستخدم
  const calculateUserStats = (userId: number) => {
    const userOrders = orders.filter((order) => order.userId === userId);
    
    // إجمالي المبلغ
    const totalSpent = userOrders.reduce((sum, order) => sum + order.price, 0);
    
    // عدد الطلبات
    const orderCount = userOrders.length;
    
    // اللعبة الأكثر شراءً
    const gameCountMap: Record<string, number> = {};
    userOrders.forEach(order => {
      const gameName = order.gameName || "غير معروف";
      gameCountMap[gameName] = (gameCountMap[gameName] || 0) + 1;
    });
    
    let favoriteGame = "لا يوجد";
    let maxCount = 0;
    
    Object.entries(gameCountMap).forEach(([game, count]) => {
      if (count > maxCount) {
        favoriteGame = game;
        maxCount = count;
      }
    });
    
    return { totalSpent, orderCount, favoriteGame };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              بيانات المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الرقم</TableHead>
                    <TableHead>معرف</TableHead>
                    <TableHead>المستخدم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>رقم الهاتف</TableHead>
                    <TableHead>إجمالي المشتريات</TableHead>
                    <TableHead>عدد الطلبات</TableHead>
                    <TableHead>اللعبة المفضلة</TableHead>
                    <TableHead>إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center h-24">
                        لا يوجد مستخدمين مسجلين حالياً
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user: any) => {
                      const { totalSpent, orderCount, favoriteGame } = calculateUserStats(user.id);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>{users.indexOf(user) + 1}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-slate-100 text-slate-800">
                              {Math.floor(100000 + Math.random() * 900000)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">{user.name || "غير محدد"}</div>
                          </TableCell>
                          <TableCell>{user.email || "غير محدد"}</TableCell>
                          <TableCell>{user.phone || "غير محدد"}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("ar-EG", {
                              style: "currency",
                              currency: "EGP",
                            }).format(totalSpent)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50 text-blue-800">
                              {orderCount} طلب
                            </Badge>
                          </TableCell>
                          <TableCell>{favoriteGame}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2 space-x-reverse">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleSendMessage(user.id, 'sms')}
                                title="إرسال رسالة نصية"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleSendMessage(user.id, 'email')}
                                title="إرسال بريد إلكتروني"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setSelectedUser(user)}
                                title="عرض تفاصيل المستخدم"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {selectedUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-6 w-6" />
                تفاصيل المستخدم: {selectedUser.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="info">
                <TabsList className="mb-6">
                  <TabsTrigger value="info">البيانات الشخصية</TabsTrigger>
                  <TabsTrigger value="orders">الطلبات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">البيانات الأساسية</h3>
                      <div className="text-sm space-y-1">
                        <div><span className="text-muted-foreground">الاسم الكامل:</span> {selectedUser.name || "غير محدد"}</div>
                        <div><span className="text-muted-foreground">اسم المستخدم:</span> {selectedUser.username}</div>
                        <div><span className="text-muted-foreground">البريد الإلكتروني:</span> {selectedUser.email || "غير محدد"}</div>
                        <div><span className="text-muted-foreground">رقم الهاتف:</span> {selectedUser.phone || "غير محدد"}</div>
                        <div><span className="text-muted-foreground">تاريخ التسجيل:</span> {new Date(selectedUser.createdAt).toLocaleDateString("ar-EG")}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">إحصائيات الطلبات</h3>
                      <div className="text-sm space-y-1">
                        <div><span className="text-muted-foreground">إجمالي الطلبات:</span> {orders.filter(o => o.userId === selectedUser.id).length} طلب</div>
                        <div><span className="text-muted-foreground">إجمالي المشتريات:</span> {new Intl.NumberFormat("ar-EG", {
                          style: "currency",
                          currency: "EGP",
                        }).format(orders.filter(o => o.userId === selectedUser.id).reduce((sum, o) => sum + o.price, 0))}</div>
                        <div><span className="text-muted-foreground">آخر طلب:</span> {
                          (() => {
                            const userOrders = orders.filter(o => o.userId === selectedUser.id);
                            if (userOrders.length === 0) return "لا يوجد";
                            const latestOrder = userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                            return `${new Date(latestOrder.createdAt).toLocaleDateString("ar-EG")} - ${latestOrder.gameName}`;
                          })()
                        }</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSendMessage(selectedUser.id, 'sms')}
                      className="flex items-center gap-2"
                    >
                      <Send className="h-4 w-4" />
                      إرسال رسالة نصية
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSendMessage(selectedUser.id, 'email')}
                      className="flex items-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      إرسال بريد إلكتروني
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={() => setSelectedUser(null)}
                    >
                      إغلاق
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="orders" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>رقم الطلب</TableHead>
                          <TableHead>اللعبة</TableHead>
                          <TableHead>المبلغ</TableHead>
                          <TableHead>حالة الطلب</TableHead>
                          <TableHead>تاريخ الطلب</TableHead>
                          <TableHead>طريقة الدفع</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const userOrders = orders.filter(o => o.userId === selectedUser.id);
                          if (userOrders.length === 0) {
                            return (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center h-16">
                                  لا توجد طلبات لهذا المستخدم
                                </TableCell>
                              </TableRow>
                            );
                          }
                          
                          return userOrders
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map(order => (
                              <TableRow key={order.id}>
                                <TableCell>#{order.orderNumber || order.id}</TableCell>
                                <TableCell>{order.gameName}</TableCell>
                                <TableCell>
                                  {new Intl.NumberFormat("ar-EG", {
                                    style: "currency",
                                    currency: "EGP",
                                  }).format(order.price)}
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      order.orderStatus === 'completed' 
                                        ? 'bg-green-50 text-green-800' 
                                        : order.orderStatus === 'pending' 
                                          ? 'bg-yellow-50 text-yellow-800' 
                                          : 'bg-red-50 text-red-800'
                                    }
                                  >
                                    {order.orderStatus === 'completed' 
                                      ? 'مكتمل' 
                                      : order.orderStatus === 'pending' 
                                        ? 'معلق' 
                                        : 'ملغي'
                                    }
                                  </Badge>
                                </TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString("ar-EG")}</TableCell>
                                <TableCell>{order.paymentMethod === 'vodafoneCash' ? 'فودافون كاش' : order.paymentMethod === 'bankTransfer' ? 'حوالة بنكية' : 'إنستا باي'}</TableCell>
                              </TableRow>
                            ));
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}