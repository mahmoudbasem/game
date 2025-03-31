import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Icons
import {
  Home,
  Settings,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Menu,
  X,
  UserCog
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  // Get admin profile info
  const { data: adminProfile } = useQuery({
    queryKey: ["/api/admin/profile"],
    queryFn: getQueryFn<any>({
      on401: "returnNull",
    }),
  });

  // Navigation items
  const navItems = [
    { href: "/admin/dashboard", icon: <Home size={18} />, label: "لوحة التحكم" },
    { href: "/admin/orders", icon: <ShoppingCart size={18} />, label: "الطلبات" },
    { href: "/admin/games", icon: <Package size={18} />, label: "الألعاب" },
    { href: "/admin/users", icon: <Users size={18} />, label: "المستخدمين" },
    { href: "/admin/admins", icon: <UserCog size={18} />, label: "المسؤولين" },
    { href: "/admin/settings", icon: <Settings size={18} />, label: "الإعدادات" },
  ];

  // Close mobile nav when route changes
  useEffect(() => {
    setOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "تم تسجيل الخروج بنجاح",
      });
      window.location.href = "/admin/login";
    } catch (error) {
      toast({
        title: "خطأ في تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  // Navigation component (used in both desktop and mobile)
  const NavLinks = () => (
    <div className="space-y-1 py-4 flex flex-col h-full">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          لوحة التحكم
        </h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={location === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                {item.icon}
                <span className="mr-2">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <Separator />
      {adminProfile && (
        <div className="px-7 py-4 mt-auto">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium">{adminProfile.name}</p>
            <p className="text-xs text-muted-foreground">
              {adminProfile.role === "admin" ? "مدير النظام" : "محرر"}
            </p>
            <Button variant="outline" onClick={handleLogout} className="mt-4">
              <LogOut size={16} className="ml-2" /> تسجيل الخروج
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Navigation */}
      {isMobile ? (
        <div className="flex items-center border-b px-4 h-14">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                {open ? <X size={20} /> : <Menu size={20} />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <NavLinks />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-semibold">لوحة التحكم</h1>
        </div>
      ) : (
        // Desktop sidebar
        <div className="hidden md:flex h-screen w-64 flex-col border-l">
          <NavLinks />
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-y-auto">
        {isMobile && <div className="h-14" />}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}