import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { getRoleDisplayName } from "../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldAlert, ArrowLeft, LogOut } from "lucide-react";

export function AdminUnauthorized() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg border-destructive/30 shadow-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <Badge variant="destructive" className="mx-auto mb-2 text-xs">
            Access Restricted
          </Badge>
          <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
            Administrative Authorization Required
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground pt-1">
            This area is restricted to presiding electoral officers and institutional administrators.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs space-y-2 text-foreground/80">
            <div className="flex justify-between items-center py-1 border-b border-border/50">
              <span className="text-muted-foreground">Account:</span>
              <span className="font-semibold text-foreground">{user?.email || "Unknown"}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Current Role:</span>
              <span className="font-semibold text-foreground capitalize">
                {getRoleDisplayName(user?.role)}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            If you need administrative access to manage elections or view candidate registers, please contact the institution&apos;s Electoral Commission.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full sm:w-auto text-xs gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
            Switch Account
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto text-xs gap-1.5 font-semibold"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
