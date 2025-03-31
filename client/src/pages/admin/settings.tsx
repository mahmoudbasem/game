import { useState } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Settings, Palette, Globe, BellRing } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSaveSettings = () => {
    setIsSubmitting(true);
    
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث إعدادات الموقع بنجاح",
      });
    }, 1000);
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إعدادات الموقع</h1>
        </div>
        
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6" />
              هذه الميزة قيد التطوير
            </CardTitle>
            <CardDescription>
              سيتم إضافة إعدادات كاملة للموقع في الإصدار القادم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="general">عام</TabsTrigger>
                <TabsTrigger value="appearance">المظهر</TabsTrigger>
                <TabsTrigger value="domain">النطاق</TabsTrigger>
                <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>اسم الموقع</Label>
                    <Input placeholder="متجر الألعاب" value="متجر الألعاب" disabled />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>البريد الإلكتروني للتواصل</Label>
                    <Input placeholder="hello@example.com" value="info@gameshop.com" disabled />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>رقم الهاتف للتواصل</Label>
                    <Input placeholder="+1234567890" value="+201XXXXXXXXX" disabled />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>تفعيل التسجيل</Label>
                      <p className="text-muted-foreground text-xs">السماح للمستخدمين بإنشاء حسابات جديدة</p>
                    </div>
                    <Switch disabled checked />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="appearance" className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>اللون الرئيسي</Label>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-md bg-primary border" />
                        <Input value="#7c3aed" disabled />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>اللون الثانوي</Label>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-md bg-secondary border" />
                        <Input value="#f9fafb" disabled />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>الوضع</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50" disabled>
                        <option value="light">فاتح</option>
                        <option value="dark">داكن</option>
                        <option value="system">تلقائي</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>خلفية مخصصة</Label>
                      <p className="text-muted-foreground text-xs">تفعيل خلفية مخصصة للموقع</p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="domain" className="space-y-4">
                <div className="space-y-2">
                  <Label>النطاق الحالي</Label>
                  <Input value="example.com" disabled />
                  <p className="text-xs text-muted-foreground">النطاق الأساسي الذي يستخدمه موقعك</p>
                </div>
                
                <div className="space-y-2">
                  <Label>النطاقات الفرعية</Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input value="www.example.com" disabled className="flex-1" />
                      <Button variant="outline" size="icon" disabled>-</Button>
                    </div>
                    <div className="flex gap-2">
                      <Input value="shop.example.com" disabled className="flex-1" />
                      <Button variant="outline" size="icon" disabled>-</Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" disabled>إضافة نطاق فرعي</Button>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>إشعارات البريد الإلكتروني</Label>
                      <p className="text-muted-foreground text-xs">إرسال إشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <Switch disabled checked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>إشعارات الواتساب</Label>
                      <p className="text-muted-foreground text-xs">إرسال إشعارات عبر الواتساب</p>
                    </div>
                    <Switch disabled checked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>إشعارات SMS</Label>
                      <p className="text-muted-foreground text-xs">إرسال إشعارات عبر الرسائل النصية</p>
                    </div>
                    <Switch disabled />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Button className="mt-6" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}