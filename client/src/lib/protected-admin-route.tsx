import { useEffect, useState } from "react";
import { Route, Redirect, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "./queryClient";
import { Loader2 } from "lucide-react";

type ProtectedAdminRouteProps = {
  path: string;
  component: React.ComponentType<any>;
};

export default function ProtectedAdminRoute({ path, component: Component }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  // Verify admin authentication
  const { data: adminProfile, isLoading, error } = useQuery({
    queryKey: ["/api/admin/profile"],
    queryFn: getQueryFn<any>({
      on401: "returnNull", // Return null on 401 Unauthorized instead of throwing error
    }),
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !adminProfile) {
      setRedirectPath("/admin/login");
    }
  }, [isLoading, adminProfile]);

  // If redirecting to login page
  if (redirectPath) {
    return (
      <Route path={path}>
        {() => <Redirect to={redirectPath} />}
      </Route>
    );
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Route path={path}>
        {() => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Route>
    );
  }

  // Admin is authenticated, render the protected component
  return (
    <Route path={path}>
      {(params) => <Component {...params} />}
    </Route>
  );
}