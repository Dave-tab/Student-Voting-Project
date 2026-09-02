import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 shrink-0 rounded border border-border bg-background accent-foreground",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}