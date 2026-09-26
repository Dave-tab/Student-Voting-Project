import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { LogOut } from "lucide-react";
import {
  ApplicationShell,
  ApplicationBody,
  MainContent,
} from "@/components/layouts/ApplicationShell";
import {
  ApplicationHeader,
  ApplicationIdentity,
  UserArea,
} from "@/components/layouts/ApplicationHeader";
import { ApplicationSidebar } from "@/components/layouts/ApplicationSidebar";
import { MobileNavigation } from "@/components/layouts/MobileNavigation";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function RootLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const userInitials = user?.email ? user.email.slice(0, 2).toUpperCase() : "U";

  return (
    <ApplicationShell>
      <ApplicationHeader className="px-3 sm:px-6 lg:px-8">
        {/* Mobile Header (Strictly locked per PUX-04-FINAL) */}
        <div className="flex w-full items-center justify-between md:hidden min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <MobileNavigation />
            <img
              src="/images/branding/polytechnic-ibadan-logo.png"
              alt="The Polytechnic, Ibadan"
              className="h-7 w-7 shrink-0 rounded-full object-contain border border-border/80 bg-white p-0.5 shadow-xs"
            />
            <span className="text-xs font-bold tracking-tight text-foreground truncate">
              The Polytechnic, Ibadan
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <ThemeToggle />
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex w-full items-center justify-between">
          <ApplicationIdentity>Student Online Voting Platform</ApplicationIdentity>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserArea>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground font-medium">
                  {user?.email}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground hover:text-red-600 flex items-center gap-1.5 transition-colors"
                  onClick={handleSignOut}
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-medium">Sign Out</span>
                </Button>
              </div>
            </UserArea>
          </div>
        </div>
      </ApplicationHeader>
      <ApplicationBody>
        <ApplicationSidebar />
        <MainContent>
          <Outlet />
        </MainContent>
      </ApplicationBody>
    </ApplicationShell>
  );
}