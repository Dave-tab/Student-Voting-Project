import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { isAdministrativeRole } from "../types";
import { AdminUnauthorized } from "./AdminUnauthorized";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface AdminRouteProps {
  children?: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-foreground/70">
          Verifying administrative credentials...
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Redirect unauthenticated requests to login, preserving intended path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verify administrative role
  if (!isAdministrativeRole(user?.role)) {
    return <AdminUnauthorized />;
  }

  return children ? <>{children}</> : null;
}
