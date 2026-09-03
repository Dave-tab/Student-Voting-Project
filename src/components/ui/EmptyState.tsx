import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement>;

function EmptyState({ className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-8 text-center",
        className
      )}
      {...props}
    />
  );
}

export type EmptyStateIconProps = HTMLAttributes<HTMLDivElement>;

function EmptyStateIcon({
  className,
  "aria-hidden": ariaHidden = true,
  ...props
}: EmptyStateIconProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(
        "mb-2 flex h-10 w-10 items-center justify-center text-foreground/40",
        className
      )}
      {...props}
    />
  );
}

export type EmptyStateTitleProps = HTMLAttributes<HTMLHeadingElement>;

function EmptyStateTitle({ className, ...props }: EmptyStateTitleProps) {
  return (
    <h3
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export type EmptyStateDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

function EmptyStateDescription({
  className,
  ...props
}: EmptyStateDescriptionProps) {
  return (
    <p
      className={cn("max-w-sm text-sm text-foreground/60", className)}
      {...props}
    />
  );
}

export type EmptyStateActionProps = ButtonHTMLAttributes<HTMLButtonElement>;

function EmptyStateAction({ className, ...props }: EmptyStateActionProps) {
  return (
    <button
      type="button"
      className={cn(
        "mt-4 inline-flex items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateAction,
};