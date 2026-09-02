import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const alertVariantStyles: Record<AlertVariant, string> = {
  info: "border-border bg-background text-foreground",
  success: "border-green-600/40 bg-green-600/10 text-green-700 dark:text-green-400",
  warning: "border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  error: "border-red-600/40 bg-red-600/10 text-red-700 dark:text-red-400",
};

const alertRole: Record<AlertVariant, "status" | "alert"> = {
  info: "status",
  success: "status",
  warning: "status",
  error: "alert",
};

export function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      role={alertRole[variant]}
      className={cn(
        "w-full rounded-lg border p-4 text-sm",
        alertVariantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export interface AlertDescriptionProps extends HTMLAttributes<HTMLDivElement> {}

export function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  );
}