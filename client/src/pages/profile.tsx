import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import MainLayout from '@/components/layouts/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { Order } from '@shared/schema';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// الأنواع الإضافية
type DiscountCode = {
  id: number;
  code: string;
  discountPercent: number;
  expiresAt: string;
  maxUses: number;
  usedCount: number;
};

export default function Profile() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('orders');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch user orders
  const { data: orders, isLoading: isLoadingOrders } = useQuery<Order[]>({ 
    queryKey: ['/api/orders/user'],
    enabled: !!user,
    initialData: []
  });

  // Fetch user discount codes
  const { data: discountCodes, isLoading: isLoadingCodes } = useQuery<DiscountCode[]>({ 
    queryKey: ['/api/discount-codes/user'],
    enabled: !!user,
    initialData: []
  });

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  const getOrderStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'مكتمل', class: 'bg-green-100 text-green-800' };
      case 'processing':
        return { label: 'قيد التنفيذ', class: 'bg-blue-100 text-blue-800' };
      case 'cancelled':
        return { label: 'ملغي', class: 'bg-red-100 text-red-800' };
      default:
        return { label: 'قيد الانتظار', class: 'bg-yellow-100 text-yellow-800' };
    }
  };

  const getPaymentMethod = (method: string) => {
    switch (method) {
      case 'vodafoneCash':
        return 'فودافون كاش';
      case 'instaPay':
        return 'انستا باي';
      case 'bankTransfer':
        return 'تحويل بنكي';
      default:
        return method;
    }
  };

  const formatDate = (dateString: string | Date) => {
    return format(new Date(dateString), 'PPP', { locale: ar });
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">الملف الشخصي</CardTitle>
                <CardDescription>إدارة حسابك وطلباتك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-3">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <h3 className="text-lg font-medium">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.username}@example.com</p>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-700 hover:text-primary hover:bg-primary/10"
                      onClick={() => setActiveTab('orders')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      طلباتي
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-700 hover:text-primary hover:bg-primary/10"
                      onClick={() => setActiveTab('discounts')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      أكواد الخصم
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-700 hover:text-primary hover:bg-primary/10"
                      onClick={() => setActiveTab('settings')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      إعدادات الحساب
                    </Button>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      تسجيل الخروج
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="orders">طلباتي</TabsTrigger>
                <TabsTrigger value="discounts">أكواد الخصم</TabsTrigger>
                <TabsTrigger value="settings">إعدادات الحساب</TabsTrigger>
              </TabsList>
              
              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>طلباتي</CardTitle>
                    <CardDescription>قائمة بجميع طلباتك السابقة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingOrders ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-500">جاري تحميل الطلبات...</p>
                      </div>
                    ) : orders.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b text-right">
                              <th className="py-3 font-medium">رقم الطلب</th>
                              <th className="py-3 font-medium">التاريخ</th>
                              <th className="py-3 font-medium">اللعبة</th>
                              <th className="py-3 font-medium">القيمة</th>
                              <th className="py-3 font-medium">الحالة</th>
                              <th className="py-3 font-medium">عرض</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map((order: Order) => (
                              <tr key={order.id} className="border-b">
                                <td className="py-3">{order.orderNumber}</td>
                                <td className="py-3">{formatDate(order.createdAt)}</td>
                                <td className="py-3">{order.gameAccountId}</td>
                                <td className="py-3">{order.price} ج.م.</td>
                                <td className="py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs ${getOrderStatus(order.orderStatus).class}`}>
                                    {getOrderStatus(order.orderStatus).label}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <Button variant="outline" size="sm">
                                    عرض التفاصيل
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium">لا توجد طلبات بعد</h3>
                        <p className="mt-2 text-gray-500">لم تقم بعمل أي طلبات حتى الآن</p>
                        <Button 
                          className="mt-4"
                          onClick={() => navigate('/order')}
                        >
                          إنشاء طلب جديد
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Discount Codes Tab */}
              <TabsContent value="discounts">
                <Card>
                  <CardHeader>
                    <CardTitle>أكواد الخصم</CardTitle>
                    <CardDescription>أكواد الخصم المتاحة لك</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingCodes ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-gray-500">جاري تحميل أكواد الخصم...</p>
                      </div>
                    ) : discountCodes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {discountCodes.map((code: DiscountCode) => (
                          <div key={code.id} className="border rounded-lg p-4 bg-primary/5">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-bold text-primary">{code.code}</h3>
                              <span className="text-sm font-medium bg-primary text-white px-3 py-1 rounded-full">
                                {code.discountPercent}% خصم
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                              صالح حتى: {code.expiresAt ? formatDate(code.expiresAt) : 'غير محدد المدة'}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {code.maxUses - code.usedCount} استخدامات متبقية
                              </span>
                              <Button variant="outline" size="sm">نسخ الكود</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium">لا توجد أكواد خصم</h3>
                        <p className="mt-2 text-gray-500">لا توجد أكواد خصم متاحة لك حالياً</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>إعدادات الحساب</CardTitle>
                    <CardDescription>تعديل بيانات حسابك الشخصي</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="mt-4 text-lg font-medium">إعدادات الحساب</h3>
                      <p className="mt-2 text-gray-500">هذه الميزة ستكون متاحة قريباً</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}