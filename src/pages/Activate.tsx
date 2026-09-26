import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Loader2, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { activateStudentAccount } from "@/services/studentActivationService";

const activateSchema = z
  .object({
    matriculationNumber: z
      .string()
      .min(3, "Please enter a valid matriculation number.")
      .trim(),
    email: z
      .string()
      .email("Please enter a valid institutional email address.")
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long."),
    confirmPassword: z
      .string()
      .min(8, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ActivateSchemaType = z.infer<typeof activateSchema>;

export default function Activate() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivateSchemaType>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      matriculationNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ActivateSchemaType) => {
    setErrorMsg(null);
    try {
      const result = await activateStudentAccount({
        matriculationNumber: data.matriculationNumber,
        institutionalEmail: data.email,
        password: data.password,
      });

      if (!result.success) {
        setErrorMsg(result.message || "Institutional identity verification failed.");
        return;
      }

      setSuccessMsg(result.message);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during verification. Please try again.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Institutional Student Identity Verification</span>
        </div>
        <div className="flex items-center gap-3">
          <img
            src="/images/branding/polytechnic-ibadan-logo.png"
            alt="The Polytechnic, Ibadan Seal"
            className="h-10 w-10 shrink-0 rounded-full object-contain border border-border bg-white p-0.5"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Activate Your Student Account
            </h1>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              The Polytechnic, Ibadan — Online Voting Platform
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Verify your matriculation number against the institutional student registry to establish your authenticated voting account.
        </p>
      </div>

      <Card className="border border-border bg-card shadow-sm">
        {success ? (
          <CardContent className="pt-6 space-y-6 text-center py-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">Account Successfully Activated!</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {successMsg || "Your institutional identity has been successfully validated. Your account is now active and ready for use."}
              </p>
            </div>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate("/login")}>
                Proceed to Sign In
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Institutional Identity Verification</CardTitle>
              <CardDescription>
                Provide your official matriculation number and registered institutional email address. This will be verified against the institutional registry before account creation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMsg && (
                <Alert variant="error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Error</AlertTitle>
                  <AlertDescription>{errorMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="matriculationNumber">Matriculation Number</Label>
                <Input
                  id="matriculationNumber"
                  placeholder="e.g. 2019235020403"
                  disabled={isSubmitting}
                  {...register("matriculationNumber")}
                />
                {errors.matriculationNumber && (
                  <p className="text-xs text-red-600 font-medium" role="alert">
                    {errors.matriculationNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Institutional Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@polyibadan.edu.ng"
                  disabled={isSubmitting}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 font-medium" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  disabled={isSubmitting}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 font-medium" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  disabled={isSubmitting}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 font-medium" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Already activated?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Sign in here
                </Link>
              </p>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying Institutional Identity...
                  </>
                ) : (
                  "Verify & Establish Account"
                )}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
