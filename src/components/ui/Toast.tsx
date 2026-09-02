import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export type ToastProps = HTMLAttributes<HTMLDivElement>;

function Toast({ className, ...props }: ToastProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-md border border-border bg-background p-4 shadow-md",
        className
      )}
      {...props}
    />
  );
}

export type ToastTitleProps = HTMLAttributes<HTMLParagraphElement>;

function ToastTitle({ className, ...props }: ToastTitleProps) {
  return (
    <p
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export type ToastDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

function ToastDescription({ className, ...props }: ToastDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-foreground/60", className)}
      {...props}
    />
  );
}

export type ToastCloseProps = ButtonHTMLAttributes<HTMLButtonElement>;

function ToastClose({
  className,
  children,
  "aria-label": ariaLabel = "Close",
  ...props
}: ToastCloseProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={cn(
        "ml-auto shrink-0 rounded-md p-1 text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      {children ?? <span aria-hidden="true">×</span>}
    </button>
  );
}

export { Toast, ToastTitle, ToastDescription, ToastClose };