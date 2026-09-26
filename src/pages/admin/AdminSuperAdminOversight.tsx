import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import {
  UserPlus,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { provisionAdminAccount } from "@/features/admin/services/adminProvisioningService";

export default function AdminSuperAdminOversight() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "administrator" | "electoral_officer">("electoral_officer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provisionSuccess, setProvisionSuccess] = useState<string | null>(null);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setProvisionSuccess(null);
    setProvisionError(null);

    if (!email || !password) {
      setProvisionError("Email and temporary password are required.");
      return;
    }

    if (password.length < 8) {
      setProvisionError("Password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await provisionAdminAccount({
        email,
        password,
        role,
      });

      if (!result.success) {
        setProvisionError(result.message || "Failed to provision administrative account.");
        return;
      }

      setProvisionSuccess(
        `Successfully provisioned administrative account for ${email} with role '${role.replace("_", " ")}'.`
      );
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setProvisionError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Platform Administration &amp; Oversight
            </h1>
            <Badge variant="secondary" className="text-xs font-bold border-primary text-primary">
              Super Administrator
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage electoral officer accounts, monitor system health, and oversee institutional election integrity.
          </p>
        </div>
      </div>

      {/* Administrative Account Provisioning */}
      <Card className="border border-border bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" />
              <CardTitle className="text-base font-bold text-foreground">
                Provision Administrative User
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              Authorized Officers Only
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Create verified administrative identities for presiding electoral officers and institutional administrators.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleProvision}>
          <CardContent className="space-y-4 pt-4">
            {provisionSuccess && (
              <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Account Provisioned</AlertTitle>
                <AlertDescription className="text-xs">{provisionSuccess}</AlertDescription>
              </Alert>
            )}

            {provisionError && (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Provisioning Error</AlertTitle>
                <AlertDescription className="text-xs">{provisionError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="adminEmail" className="text-xs">
                  Officer / Admin Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  placeholder="officer@polyibadan.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminPassword" className="text-xs">
                  Temporary Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="adminPassword"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminRole" className="text-xs">
                  Administrative Role <span className="text-destructive">*</span>
                </Label>
                <select
                  id="adminRole"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "admin" | "administrator" | "electoral_officer")
                  }
                  disabled={isSubmitting}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                >
                  <option value="electoral_officer">Electoral Officer</option>
                  <option value="administrator">System Administrator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t border-border bg-muted/10 px-6 py-3">
            <Button type="submit" disabled={isSubmitting} size="sm" className="text-xs font-semibold">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Provisioning...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>


    </div>
  );
}
