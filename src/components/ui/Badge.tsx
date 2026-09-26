import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: "border-primary/20 bg-primary/10 text-primary",
  secondary: "border-border bg-muted text-muted-foreground",
  success: "border-emerald-600/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  warning: "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  destructive: "border-red-600/20 bg-red-500/10 text-red-800 dark:text-red-300",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariantStyles[variant],
        className
      )}
      {...props}
    />
  );
}