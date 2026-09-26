import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "@/features/auth/AuthContext";
import { VotingProvider } from "@/features/voting/context/VotingContext";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <VotingProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </VotingProvider>
    </AuthProvider>
  );
}