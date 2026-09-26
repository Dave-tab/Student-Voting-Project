import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        <p className="text-sm font-medium text-foreground/70">Verifying security credentials...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    // Redirect to login page, preserving the original requested URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
}
