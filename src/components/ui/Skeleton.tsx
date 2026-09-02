import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-md bg-foreground/10 motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}

export type SpinnerProps = HTMLAttributes<HTMLDivElement>;

function Spinner({
  className,
  "aria-label": ariaLabel = "Loading",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-foreground/60 motion-reduce:animate-none",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton, Spinner };