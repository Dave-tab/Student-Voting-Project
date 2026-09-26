import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { isAdministrativeRole } from "@/features/admin/types";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Loader2 } from "lucide-react";

export default function Login() {
  const { status, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === "authenticated" && user?.role) {
      if (isAdministrativeRole(user.role)) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [status, user?.role, navigate]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-background text-foreground space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
        <p className="text-sm font-medium text-foreground/70">Restoring secure session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center space-y-3">
          <img
            src="/images/branding/polytechnic-ibadan-logo.png"
            alt="The Polytechnic, Ibadan Seal"
            className="h-16 w-16 rounded-full object-contain border border-border bg-white p-1 shadow-sm"
          />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              The Polytechnic, Ibadan
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mt-1">
              Student Online Voting Platform
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Secure, Transparent, and Verifiable Democratic Governance
            </p>
          </div>
        </div>

        <LoginForm
          onSuccess={() => {
            if (user?.role && isAdministrativeRole(user.role)) {
              navigate("/admin", { replace: true });
            } else if (user?.role) {
              navigate("/", { replace: true });
            }
          }}
        />

        <div className="text-center text-xs text-muted-foreground mt-8">
          Authorized users only. All actions are securely logged for audit purposes.
        </div>
      </div>
    </div>
  );
}
