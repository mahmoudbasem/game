import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import OrderProcess from "@/pages/order-process";
import UserLogin from "@/pages/login";
import Register from "@/pages/register";
import Profile from "@/pages/profile";
import ProtectedAdminRoute from "@/lib/protected-admin-route";

// Admin Imports
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAdmins from "@/pages/admin/admins";
import AdminOrders from "@/pages/admin/orders";
import AdminUsers from "@/pages/admin/users";
import AdminGames from "@/pages/admin/games";
import AdminSettings from "@/pages/admin/settings";

function AppRoutes() {
  return (
    <Switch>
      {/* User-facing routes */}
      <Route path="/" component={Home} />
      <Route path="/order" component={OrderProcess} />
      <Route path="/login" component={UserLogin} />
      <Route path="/register" component={Register} />
      <Route path="/profile" component={Profile} />
      
      {/* Admin login route (not protected) */}
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Protected Admin routes */}
      <ProtectedAdminRoute path="/admin" component={AdminDashboard} />
      <ProtectedAdminRoute path="/admin/dashboard" component={AdminDashboard} />
      <ProtectedAdminRoute path="/admin/orders" component={AdminOrders} />
      <ProtectedAdminRoute path="/admin/settings" component={AdminSettings} />
      <ProtectedAdminRoute path="/admin/games" component={AdminGames} />
      <ProtectedAdminRoute path="/admin/users" component={AdminUsers} />
      <ProtectedAdminRoute path="/admin/admins" component={AdminAdmins} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
