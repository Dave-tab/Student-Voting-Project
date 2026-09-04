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

export default function RootLayout() {
  return (
    <ApplicationShell>
      <ApplicationHeader>
        <ApplicationIdentity>Student Voting Platform</ApplicationIdentity>
        <UserArea />
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