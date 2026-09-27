/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  status: AuthStatus;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authoritatively resolves user role from the database:
 * users.id -> users.role_id -> roles.name
 * Invariant (Decision 6): Database identity is authoritative.
 * User metadata must never be used as a fallback source of administrative authorization.
 * If identity or role cannot be resolved, privileged access must not be granted.
 */
async function resolveRole(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("role_id, roles(name)")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data?.roles) {
      const roleObj = Array.isArray(data.roles) ? data.roles[0] : data.roles;
      if (roleObj && typeof roleObj === "object" && "name" in roleObj && roleObj.name) {
        return (roleObj as { name: string }).name.toLowerCase();
      }
    }
  } catch (err) {
    console.warn("Could not query user role from database:", err);
  }
  // Default unprivileged student role; never trust user_metadata for administrative privilege
  return "student";
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // 1. Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting initial session:", error);
          setStatus("unauthenticated");
          setUser(null);
          return;
        }

        if (session && session.user) {
          const role = await resolveRole(session.user.id);
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role,
          });
          setStatus("authenticated");
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
        setStatus("unauthenticated");
        setUser(null);
      }
    };

    getInitialSession();

    // 2. Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session && session.user) {
        const role = await resolveRole(session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          role,
        });
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("unauthenticated");
      }
    });

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        return { error };
      }
      if (data?.session?.user) {
        const role = await resolveRole(data.session.user.id);
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || "",
          role,
        });
        setStatus("authenticated");
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("An unexpected error occurred during sign in") };
    }
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error };
      }
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error("An unexpected error occurred during sign out") };
    }
  };

  return (
    <AuthContext.Provider value={{ status, user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
