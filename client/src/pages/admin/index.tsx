import { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Dashboard from './dashboard';
import Orders from './orders';
import Login from './login';
import { useAuth } from '@/lib/auth';
import AdminLayout from '@/components/layouts/admin-layout';

export default function AdminIndex() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user && location !== '/admin/login') {
      setLocation('/admin/login');
    }
  }, [user, loading, location, setLocation]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // We don't need this check anymore as the Login component is directly rendered from App.tsx
  // if (!user && location === '/admin/login') {
  //   return <Login />;
  // }

  // Show admin pages if authenticated
  if (user) {
    return (
      <AdminLayout>
        <Switch>
          <Route path="/admin" component={Dashboard} />
          <Route path="/admin/dashboard" component={Dashboard} />
          <Route path="/admin/orders" component={Orders} />
          <Route path="/admin/settings">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>
              <p className="text-gray-500">صفحة الإعدادات ستكون متاحة قريباً</p>
            </div>
          </Route>
          <Route path="/admin/games">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold mb-6">إدارة الألعاب</h1>
              <p className="text-gray-500">صفحة إدارة الألعاب ستكون متاحة قريباً</p>
            </div>
          </Route>
          <Route>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">404 - الصفحة غير موجودة</h1>
              <p className="text-gray-500 mb-4">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
              <button 
                onClick={() => setLocation('/admin')}
                className="px-4 py-2 bg-primary text-white rounded-md"
              >
                العودة للوحة التحكم
              </button>
            </div>
          </Route>
        </Switch>
      </AdminLayout>
    );
  }

  // Fallback for unexpected state
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-2">خطأ في تحميل لوحة التحكم</h1>
        <p className="text-gray-500 mb-4">يرجى المحاولة مرة أخرى لاحقاً</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          إعادة تحميل الصفحة
        </button>
      </div>
    </div>
  );
}
