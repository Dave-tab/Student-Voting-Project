import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ApplicationShellProps = HTMLAttributes<HTMLDivElement>;

function ApplicationShell({ className, ...props }: ApplicationShellProps) {
  return (
    <div
      className={cn("flex min-h-screen w-full flex-col", className)}
      {...props}
    />
  );
}

export type ApplicationBodyProps = HTMLAttributes<HTMLDivElement>;

function ApplicationBody({ className, ...props }: ApplicationBodyProps) {
  return <div className={cn("flex min-h-0 flex-1", className)} {...props} />;
}

export type MainContentProps = HTMLAttributes<HTMLElement>;

function MainContent({ className, ...props }: MainContentProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  );
}

export { ApplicationShell, ApplicationBody, MainContent };