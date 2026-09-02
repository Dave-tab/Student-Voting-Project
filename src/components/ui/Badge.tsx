import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const badgeVariantStyles: Record<BadgeVariant, string> = {
  default: "border-transparent bg-foreground text-background",
  secondary: "border-transparent bg-input text-foreground",
  success: "border-transparent bg-green-600 text-white",
  warning: "border-transparent bg-yellow-500 text-black",
  destructive: "border-transparent bg-red-600 text-white",
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