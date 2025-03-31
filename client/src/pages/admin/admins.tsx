import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

// Components
import AdminLayout from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import { useToast } from "@/hooks/use-toast";

// Icons
import { Plus, Edit2, Trash2, UserCog } from "lucide-react";

// Admin schema
const adminSchema = z.object({
  username: z.string().min(3, { message: "اسم المستخدم يجب أن يكون 3 أحرف على الأقل" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }),
  name: z.string().min(2, { message: "الاسم مطلوب" }),
  role: z.enum(["admin", "editor"], {
    errorMap: () => ({
      message: "الرجاء اختيار الدور",
    }),
  }),
});

type AdminFormData = z.infer<typeof adminSchema>;

export default function AdminsPage() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: "editor",
    },
  });

  // Fetch admin list
  const { data: admins, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/list"],
    queryFn: getQueryFn<any[]>({
      on401: "throw",
    }),
  });

  // Create new admin
  const createAdminMutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      const response = await apiRequest("POST", "/api/admin/create", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء المسؤول بنجاح",
      });
      reset();
      setOpenAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/list"] });
    },
    onError: (error) => {
      toast({
        title: "خطأ في إنشاء المسؤول",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: AdminFormData) => {
    createAdminMutation.mutate(data);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "غير متوفر";
    return new Intl.DateTimeFormat("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">إدارة المسؤولين</h1>
          
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" /> إضافة مسؤول جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>إضافة مسؤول جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المسؤول الجديد. سيتمكن المسؤول من الوصول إلى لوحة التحكم حسب الدور المحدد.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      الاسم
                    </Label>
                    <Input
                      id="name"
                      placeholder="الاسم الكامل"
                      className="col-span-3"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="col-span-4 text-sm text-red-500 text-right">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      اسم المستخدم
                    </Label>
                    <Input
                      id="username"
                      placeholder="اسم المستخدم للدخول"
                      className="col-span-3"
                      {...register("username")}
                    />
                    {errors.username && (
                      <p className="col-span-4 text-sm text-red-500 text-right">
                        {errors.username.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      كلمة المرور
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="كلمة المرور"
                      className="col-span-3"
                      {...register("password")}
                    />
                    {errors.password && (
                      <p className="col-span-4 text-sm text-red-500 text-right">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">
                      الدور
                    </Label>
                    <Select 
                      onValueChange={value => setValue("role", value as "admin" | "editor")}
                      defaultValue="editor"
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="اختر الدور" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مدير النظام (صلاحيات كاملة)</SelectItem>
                        <SelectItem value="editor">محرر (صلاحيات محدودة)</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="col-span-4 text-sm text-red-500 text-right">
                        {errors.role.message}
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createAdminMutation.isPending}>
                    {createAdminMutation.isPending ? "جاري الإضافة..." : "إضافة مسؤول"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">اسم المستخدم</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right">آخر تسجيل دخول</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : !admins?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    لا يوجد مسؤولين حتى الآن
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.username}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        admin.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {admin.role === "admin" ? "مدير النظام" : "محرر"}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(admin.createdAt)}</TableCell>
                    <TableCell>{admin.lastLogin ? formatDate(admin.lastLogin) : "لم يسجل الدخول بعد"}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center space-x-2">
                        <Button variant="ghost" size="icon" title="تعديل" disabled>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="حذف" disabled>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
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