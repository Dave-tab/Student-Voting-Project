import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import * as z from "zod";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid institutional or registered email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setErrorMsg(null);
    try {
      const { error } = await signIn(data.email, data.password);
      if (error) {
        // Map common Supabase errors to friendly messages
        if (error.message.includes("Invalid login credentials") || error.message.includes("Invalid")) {
          setErrorMsg("Invalid email address or password.");
        } else {
          setErrorMsg(error.message || "An error occurred during authentication.");
        }
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected system error occurred. Please try again later.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border border-border bg-card shadow-sm">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Voter Portal Login</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
          Please log in with your registered email and password to access elections.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {errorMsg && (
            <Alert variant="error" className="animate-fade-in">
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/40">
                <Mail className="h-4 w-4" />
              </span>
              <Input
                id="email"
                type="email"
                placeholder="you@registered-email.com"
                className="pl-10"
                disabled={isSubmitting}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 font-medium" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-foreground/40">
                <Lock className="h-4 w-4" />
              </span>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                disabled={isSubmitting}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-foreground/40 hover:text-foreground transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 font-medium" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full flex items-center justify-center h-11"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : (
              "Sign In to Vote"
            )}
          </Button>

          <div className="w-full border-t border-border my-2" />

          <div className="text-center text-xs space-y-1">
            <span className="text-muted-foreground">First time here?</span>{" "}
            <Link
              to="/activate"
              className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
            >
              Activate your account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
