import type { HTMLAttributes } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { isAdministrativeRole } from "@/features/admin/types";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Vote, ShieldCheck, User, ShieldAlert } from "lucide-react";

export type ApplicationSidebarProps = HTMLAttributes<HTMLElement>;

function ApplicationSidebar({ className, ...props }: ApplicationSidebarProps) {
  const { user } = useAuth();
  const isAdmin = isAdministrativeRole(user?.role);

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
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/elections"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <Vote className="h-4 w-4" />
          Elections
        </NavLink>
        <NavLink
          to="/activate"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <ShieldCheck className="h-4 w-4" />
          Activation
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )
          }
        >
          <User className="h-4 w-4" />
          Profile
        </NavLink>

        {isAdmin && (
          <div className="pt-4 mt-3 border-t border-border">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Electoral Commission
            </span>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-primary hover:bg-primary/10",
                  isActive ? "bg-primary/15 font-semibold" : ""
                )
              }
            >
              <ShieldAlert className="h-4 w-4" />
              Administration
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
}

export { ApplicationSidebar };