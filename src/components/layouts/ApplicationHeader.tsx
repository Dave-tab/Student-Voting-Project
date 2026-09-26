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
      className={cn(
        "flex items-center gap-3 min-w-0",
        className
      )}
      {...props}
    >
      <img
        src="/images/branding/polytechnic-ibadan-logo.png"
        alt="The Polytechnic, Ibadan Seal"
        className="h-10 w-10 shrink-0 rounded-full object-contain border border-border/80 bg-white p-0.5 shadow-xs"
      />
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
          The Polytechnic, Ibadan
        </span>
        <span className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate mt-0.5 leading-snug">
          {children ?? "Student Online Voting Platform"}
        </span>
      </div>
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