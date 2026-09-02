import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground",
        "placeholder:text-foreground/50",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}