import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { isAdministrativeRole } from "@/features/admin/types";
import { cn } from "@/lib/utils";

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="6" y1="18" x2="18" y2="6" />
    </svg>
  );
}

function MobileNavigation() {
  const { user, signOut } = useAuth();
  const isAdmin = isAdministrativeRole(user?.role);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-md p-2 text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
      >
        <MenuIcon />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/20"
            onClick={close}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-background p-5 flex flex-col">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/branding/polytechnic-ibadan-logo.png"
                  alt="The Polytechnic, Ibadan Seal"
                  className="h-8 w-8 rounded-full object-contain border border-border/80 bg-white p-0.5"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
                    The Polytechnic, Ibadan
                  </span>
                  <span className="text-xs font-bold text-foreground mt-0.5 leading-snug">
                    Student Voting
                  </span>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={close}
                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <CloseIcon />
              </button>
            </div>
            <nav aria-label="Primary" className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
              <NavLink
                to="/"
                end
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/elections"
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                Elections
              </NavLink>
              <NavLink
                to="/activate"
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                Activation
              </NavLink>
              <NavLink
                to="/profile"
                onClick={close}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                Profile
              </NavLink>

              {isAdmin && (
                <div className="pt-3 mt-2 border-t border-border">
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Electoral Commission
                  </span>
                  <NavLink
                    to="/admin"
                    onClick={close}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-primary font-semibold",
                        isActive ? "bg-primary/15" : "hover:bg-primary/10"
                      )
                    }
                  >
                    Administration
                  </NavLink>
                </div>
              )}
            </nav>

            {user && (
              <div className="pt-4 mt-auto border-t border-border space-y-3">
                <div className="px-3 py-1.5 rounded-md bg-muted/30">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Signed in as
                  </span>
                  <span className="text-xs font-semibold text-foreground truncate block mt-0.5">
                    {user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    close();
                    await signOut();
                    window.location.href = "/login";
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export { MobileNavigation };