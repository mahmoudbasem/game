import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Link } from 'wouter';
import MainLayout from '@/components/layouts/main-layout';

// Schema for username-based login
const usernameLoginSchema = z.object({
  username: z.string().min(1, 'اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// Schema for email-based login
const emailLoginSchema = z.object({
  email: z.string().email('يرجى إدخال بريد إلكتروني صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

// Schema for phone-based login
const phoneLoginSchema = z.object({
  phone: z.string().min(9, 'يرجى إدخال رقم هاتف صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type UsernameLoginFormData = z.infer<typeof usernameLoginSchema>;
type EmailLoginFormData = z.infer<typeof emailLoginSchema>;
type PhoneLoginFormData = z.infer<typeof phoneLoginSchema>;

export default function Login() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("username");

  // Forms for different login types
  const usernameForm = useForm<UsernameLoginFormData>({
    resolver: zodResolver(usernameLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const emailForm = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const phoneForm = useForm<PhoneLoginFormData>({
    resolver: zodResolver(phoneLoginSchema),
    defaultValues: {
      phone: '',
      password: '',
    },
  });

  // Handle username login
  const onUsernameSubmit = async (data: UsernameLoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email login
  const onEmailSubmit = async (data: EmailLoginFormData) => {
    setIsLoading(true);
    try {
      // Using the API directly since auth.login only accepts username
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        // Force reload to update auth state
        window.location.href = userData.isAdmin ? '/admin' : '/profile';
      } else {
        throw new Error("فشل تسجيل الدخول");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle phone login
  const onPhoneSubmit = async (data: PhoneLoginFormData) => {
    setIsLoading(true);
    try {
      // Using the API directly since auth.login only accepts username
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: data.phone, password: data.password }),
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        // Force reload to update auth state
        window.location.href = userData.isAdmin ? '/admin' : '/profile';
      } else {
        throw new Error("فشل تسجيل الدخول");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-12 sm:px-6 lg:px-8" dir="rtl">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-3 text-center text-3xl font-extrabold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ليس لديك حساب؟{' '}
            <Link href="/register">
              <span className="font-medium text-primary hover:text-primary-dark cursor-pointer">
                تسجيل عضوية جديدة
              </span>
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">تسجيل الدخول</CardTitle>
              <CardDescription className="text-center">
                أدخل بيانات الدخول للوصول إلى حسابك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="username">اسم المستخدم</TabsTrigger>
                  <TabsTrigger value="email">البريد الإلكتروني</TabsTrigger>
                  <TabsTrigger value="phone">رقم الهاتف</TabsTrigger>
                </TabsList>
                
                {/* Username Login Tab */}
                <TabsContent value="username">
                  <Form {...usernameForm}>
                    <form className="space-y-6" onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}>
                      <FormField
                        control={usernameForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم المستخدم</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل اسم المستخدم" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={usernameForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">
                            تذكرني
                          </label>
                        </div>

                        <div className="text-sm">
                          <Link href="/forgot-password">
                            <span className="font-medium text-primary hover:text-primary-dark cursor-pointer">
                              نسيت كلمة المرور؟
                            </span>
                          </Link>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري تسجيل الدخول...
                          </>
                        ) : 'تسجيل الدخول'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Email Login Tab */}
                <TabsContent value="email">
                  <Form {...emailForm}>
                    <form className="space-y-6" onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                      <FormField
                        control={emailForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>البريد الإلكتروني</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل البريد الإلكتروني" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me-email"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me-email" className="mr-2 block text-sm text-gray-900">
                            تذكرني
                          </label>
                        </div>

                        <div className="text-sm">
                          <Link href="/forgot-password">
                            <span className="font-medium text-primary hover:text-primary-dark cursor-pointer">
                              نسيت كلمة المرور؟
                            </span>
                          </Link>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري تسجيل الدخول...
                          </>
                        ) : 'تسجيل الدخول'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
                
                {/* Phone Login Tab */}
                <TabsContent value="phone">
                  <Form {...phoneForm}>
                    <form className="space-y-6" onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}>
                      <FormField
                        control={phoneForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رقم الهاتف</FormLabel>
                            <FormControl>
                              <Input placeholder="أدخل رقم الهاتف" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={phoneForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>كلمة المرور</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="أدخل كلمة المرور" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember-me-phone"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label htmlFor="remember-me-phone" className="mr-2 block text-sm text-gray-900">
                            تذكرني
                          </label>
                        </div>

                        <div className="text-sm">
                          <Link href="/forgot-password">
                            <span className="font-medium text-primary hover:text-primary-dark cursor-pointer">
                              نسيت كلمة المرور؟
                            </span>
                          </Link>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري تسجيل الدخول...
                          </>
                        ) : 'تسجيل الدخول'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="block text-center text-sm text-gray-500">
              <div className="mt-2">
                <Link href="/admin/login">
                  <span className="text-primary hover:text-primary-dark cursor-pointer">
                    تسجيل دخول المسؤولين
                  </span>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}