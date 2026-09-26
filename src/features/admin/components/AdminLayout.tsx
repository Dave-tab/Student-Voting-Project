import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { getRoleDisplayName, isSuperAdmin } from "../types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  LayoutDashboard,
  Vote,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import {
  ApplicationShell,
  ApplicationBody,
  MainContent,
} from "@/components/layouts/ApplicationShell";
import {
  ApplicationHeader,
  UserArea,
} from "@/components/layouts/ApplicationHeader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : "AD";
  const roleName = getRoleDisplayName(user?.role);
  const superAdmin = isSuperAdmin(user?.role);

  const navLinks = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: "/admin/elections",
      label: "Elections",
      icon: Vote,
      end: false,
    },
    ...(superAdmin
      ? [
          {
            to: "/admin/oversight",
            label: "Platform Oversight",
            icon: ShieldCheck,
            end: false,
          },
        ]
      : []),
  ];

  return (
    <ApplicationShell>
      {/* Top Administrative Header */}
      <ApplicationHeader className="border-b border-border bg-card/50">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-md hover:bg-muted text-foreground/70"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <img
            src="/images/branding/polytechnic-ibadan-logo.png"
            alt="The Polytechnic, Ibadan Seal"
            className="h-10 w-10 shrink-0 rounded-full object-contain border border-border/80 bg-white p-0.5 shadow-xs"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                The Polytechnic, Ibadan
              </span>
              <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-semibold border-primary/40 text-primary bg-primary/5">
                Electoral Administration
              </Badge>
            </div>
            <span className="text-sm sm:text-base font-bold tracking-tight text-foreground truncate mt-0.5 leading-snug">
              Electoral Management Portal
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <UserArea>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-foreground truncate max-w-[140px]">
                  {user?.email}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {roleName}
                </span>
              </div>

              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline text-xs font-medium">Sign Out</span>
              </Button>
            </div>
          </UserArea>
        </div>
      </ApplicationHeader>

      <ApplicationBody>
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card/20 px-3 py-6 md:flex md:flex-col justify-between">
          <div className="space-y-6">
            {/* Role Context */}
            <div className="px-3 py-2 rounded-lg border border-border bg-muted/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Presiding Role
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  {roleName}
                </span>
              </div>
            </div>

            <nav aria-label="Admin Navigation" className="flex flex-col gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-sm p-4 space-y-4 border-b border-border">
            <div className="px-3 py-2 rounded-lg border border-border bg-muted/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Presiding Role
              </span>
              <span className="text-xs font-bold text-foreground mt-0.5 block">
                {roleName}
              </span>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        )}

        <MainContent>
          <Outlet />
        </MainContent>
      </ApplicationBody>
    </ApplicationShell>
  );
}
