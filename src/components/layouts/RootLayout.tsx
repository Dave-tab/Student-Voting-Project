import { Outlet } from "react-router-dom";
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

export default function RootLayout() {
  return (
    <ApplicationShell>
      <ApplicationHeader>
        <ApplicationIdentity>Student Voting Platform</ApplicationIdentity>
        <div className="flex items-center gap-2">
          <MobileNavigation />
          <UserArea />
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