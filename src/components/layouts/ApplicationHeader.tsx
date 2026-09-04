import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";

export type ApplicationHeaderProps = HTMLAttributes<HTMLElement>;

function ApplicationHeader({ className, ...props }: ApplicationHeaderProps) {
  return (
    <header
      className={cn(
        "flex h-16 w-full items-center justify-between border-b border-border px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    />
  );
}

export type ApplicationIdentityProps = HTMLAttributes<HTMLDivElement>;

function ApplicationIdentity({
  className,
  children,
  ...props
}: ApplicationIdentityProps) {
  return (
    <div
      className={cn("text-sm font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export type UserAreaProps = HTMLAttributes<HTMLDivElement>;

function UserArea({ className, children, ...props }: UserAreaProps) {
  return (
    <div
      className={cn("flex items-center gap-3", className)}
      {...props}
    >
      {children ?? (
        <>
          <span className="hidden text-sm text-foreground/60 sm:inline">
            Guest
          </span>
          <Avatar>
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </>
      )}
    </div>
  );
}

export { ApplicationHeader, ApplicationIdentity, UserArea };