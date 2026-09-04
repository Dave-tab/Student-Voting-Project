import type { HTMLAttributes } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

export type ApplicationSidebarProps = HTMLAttributes<HTMLElement>;

function ApplicationSidebar({ className, ...props }: ApplicationSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden w-56 shrink-0 border-r border-border px-3 py-6 md:block",
        className
      )}
      {...props}
    >
      <nav aria-label="Primary" className="flex flex-col gap-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-foreground/5 text-foreground"
            )
          }
        >
          Home
        </NavLink>
      </nav>
    </aside>
  );
}

export { ApplicationSidebar };