"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AuthUser, AuthSession, Role } from "@/types/auth";
import {
  signSessionPayload,
  verifySessionToken,
  hashPassword,
} from "@/lib/auth/session-crypto";

export type { AuthUser, AuthSession, Role };

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ error?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string,
    role?: Role
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  switchRole: (role: Role) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = "cc_auth_session";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

async function saveSignedSessionCookie(authUser: AuthUser, days = 7) {
  if (typeof document === "undefined") return;
  const token = await signSessionPayload(authUser, days);
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
    token
  )}; path=/; expires=${expires}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

// Local mock storage for registered users when testing in offline/mock environments
const MOCK_REGISTERED_USERS_KEY = "cc_mock_users";

function getRegisteredUsers(): Map<string, { name: string; passwordHash: string; role: Role }> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem(MOCK_REGISTERED_USERS_KEY);
    if (!raw) return new Map();
    return new Map(JSON.parse(raw));
  } catch {
    return new Map();
  }
}

function saveRegisteredUser(email: string, name: string, passwordHash: string, role: Role = "VIEWER") {
  if (typeof window === "undefined") return;
  try {
    const map = getRegisteredUsers();
    map.set(email.toLowerCase(), { name, passwordHash, role });
    localStorage.setItem(
      MOCK_REGISTERED_USERS_KEY,
      JSON.stringify(Array.from(map.entries()))
    );
  } catch {
    // storage unavailable
  }
}

function normalizeRole(raw?: string): Role {
  if (!raw) return "VIEWER";
  const upper = raw.toUpperCase();
  if (upper === "ADMIN" || upper === "ADMINISTRATOR") return "ADMIN";
  return "VIEWER";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Initial session hydration
  React.useEffect(() => {
    async function initSession() {
      try {
        // 1. Check live Supabase session
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          const u = data.session.user;
          const role = normalizeRole(u.user_metadata?.role as string);
          setUser({
            id: u.id,
            email: u.email || "user@example.com",
            name: (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "User",
            role,
          });
          setSession({
            accessToken: data.session.access_token,
            expiresAt: data.session.expires_at || Date.now() + 3600 * 1000,
          });
          setIsLoading(false);
          return;
        }

        // 2. Check local session cookie fallback
        const savedCookie = getCookie(COOKIE_NAME);
        if (savedCookie) {
          const verified = await verifySessionToken(savedCookie);
          if (verified) {
            setUser(verified);
            setSession({
              accessToken: "mock-session-token",
              expiresAt: Date.now() + 7 * 864e5,
            });
          }
        }
      } catch (err) {
        console.error("Session restoration error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    initSession();

    // Listen to Supabase auth changes if connected
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (currentSession?.user) {
          const u = currentSession.user;
          const role = normalizeRole(u.user_metadata?.role as string);
          const authUser: AuthUser = {
            id: u.id,
            email: u.email || "",
            name: (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "User",
            role,
          };
          setUser(authUser);
          setSession({
            accessToken: currentSession.access_token,
            expiresAt: currentSession.expires_at || Date.now() + 3600 * 1000,
          });
          saveSignedSessionCookie(authUser, 7).catch(console.error);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setSession(null);
          deleteCookie(COOKIE_NAME);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Sign in handler
  const signIn = React.useCallback(
    async (email: string, password: string, rememberMe = true) => {
      const normalizedEmail = email.trim().toLowerCase();

      // Check live Supabase first if available
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (data?.user && !error) {
          const role = normalizeRole(data.user.user_metadata?.role as string);
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || normalizedEmail,
            name:
              (data.user.user_metadata?.full_name as string) ||
              normalizedEmail.split("@")[0],
            role,
          };
          setUser(authUser);
          setSession({
            accessToken: data.session.access_token,
            expiresAt: data.session.expires_at || Date.now() + 3600 * 1000,
          });
          await saveSignedSessionCookie(
            authUser,
            rememberMe ? 30 : 1
          );
          return {};
        }
      } catch {
        // Fall through to offline / local credential validation
      }

      // Demo & local offline authentication fallback
      const registered = getRegisteredUsers().get(normalizedEmail);
      const isDefaultAdmin =
        normalizedEmail === "admin@commandcenter.io" &&
        password === "Password123!";
      const isDefaultViewer =
        normalizedEmail === "viewer@commandcenter.io" &&
        password === "Password123!";

      const hashedInput = await hashPassword(password);
      const isRegisteredMatch = registered && registered.passwordHash === hashedInput;

      if (isDefaultAdmin || isDefaultViewer || isRegisteredMatch) {
        let role: Role = "VIEWER";
        let displayName = normalizedEmail.split("@")[0];

        if (isDefaultAdmin) {
          role = "ADMIN";
          displayName = "Alex Director";
        } else if (isDefaultViewer) {
          role = "VIEWER";
          displayName = "Sam Analyst";
        } else if (registered) {
          role = registered.role;
          displayName = registered.name;
        }

        const authUser: AuthUser = {
          id: isDefaultAdmin
            ? "usr_admin"
            : isDefaultViewer
            ? "usr_viewer"
            : `usr_${Date.now()}`,
          email: normalizedEmail,
          name: displayName,
          role,
        };

        setUser(authUser);
        setSession({
          accessToken: `mock-token-${Date.now()}`,
          expiresAt: Date.now() + (rememberMe ? 30 : 1) * 864e5,
        });
        await saveSignedSessionCookie(
          authUser,
          rememberMe ? 30 : 1
        );
        return {};
      }

      return {
        error: "Invalid email or password. Please verify your credentials.",
      };
    },
    [supabase]
  );

  // Sign up handler
  const signUp = React.useCallback(
    async (name: string, email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      // All self-registered users are assigned the VIEWER role
      const role: Role = "VIEWER";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return { error: "Please enter a valid email address." };
      }

      if (password.length < 8) {
        return { error: "Password must be at least 8 characters in length." };
      }

      // Check for duplicate registered accounts
      const isDefaultAdmin = normalizedEmail === "admin@commandcenter.io";
      const isDefaultViewer = normalizedEmail === "viewer@commandcenter.io";
      const isLocallyRegistered = getRegisteredUsers().has(normalizedEmail);

      if (isDefaultAdmin || isDefaultViewer || isLocallyRegistered) {
        return {
          error: "An account with this email address already exists. Please sign in.",
        };
      }

      try {
        console.log("[Supabase Auth] Calling supabase.auth.signUp for:", normalizedEmail);
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: { full_name: name.trim(), role },
          },
        });

        if (error) {
          console.error("[Supabase Auth] signUp error returned:", {
            message: error.message,
            status: error.status,
            name: error.name,
            code: (error as any).code,
          });

          const isNetworkError =
            error.name === "AuthRetryableFetchError" ||
            error.message?.includes("Failed to fetch") ||
            error.message?.includes("fetch failed");

          // Genuine Supabase Auth error (e.g. user already exists, weak password, invalid domain)
          if (!isNetworkError) {
            if (
              error.message?.toLowerCase().includes("already registered") ||
              error.message?.toLowerCase().includes("already in use") ||
              error.status === 422
            ) {
              return {
                error: "An account with this email address already exists. Please sign in.",
              };
            }
            return { error: error.message };
          }
        } else if (data?.user) {
          console.log("[Supabase Auth] signUp succeeded:", data.user.id);
          const authUser: AuthUser = {
            id: data.user.id,
            email: normalizedEmail,
            name: name.trim(),
            role,
          };
          setUser(authUser);
          await saveSignedSessionCookie(authUser, 7);
          return {};
        }
      } catch (err: unknown) {
        console.error("[Supabase Auth] Exception during signUp:", err);
      }

      // Save to local registration database with salted hash
      const hashedPassword = await hashPassword(password);
      saveRegisteredUser(normalizedEmail, name.trim(), hashedPassword, role);

      const authUser: AuthUser = {
        id: `usr_${Date.now()}`,
        email: normalizedEmail,
        name: name.trim(),
        role,
      };

      setUser(authUser);
      setSession({
        accessToken: `mock-reg-token-${Date.now()}`,
        expiresAt: Date.now() + 7 * 864e5,
      });
      await saveSignedSessionCookie(authUser, 7);

      return {};
    },
    [supabase]
  );

  // Sign out handler
  const signOut = React.useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore offline error
    } finally {
      setUser(null);
      setSession(null);
      deleteCookie(COOKIE_NAME);
      router.push("/login");
      router.refresh();
    }
  }, [supabase, router]);

  // Reset password handler
  const resetPassword = React.useCallback(
    async (email: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !normalizedEmail.includes("@")) {
        return { error: "Please enter a valid email address." };
      }

      try {
        await supabase.auth.resetPasswordForEmail(normalizedEmail);
      } catch {
        // Fallback succeeds for UX feedback
      }

      return {};
    },
    [supabase]
  );

  // Role switching helper for interactive testing
  const switchRole = React.useCallback(
    async (newRole: Role) => {
      if (!user) return;
      // Privilege escalation defense: Only default admin account or existing admin can switch back to ADMIN
      if (newRole === "ADMIN" && user.role !== "ADMIN" && user.email !== "admin@commandcenter.io") {
        console.warn("Unauthorized role elevation prevented.");
        return;
      }
      const updatedUser: AuthUser = {
        ...user,
        role: newRole,
      };
      setUser(updatedUser);
      await saveSignedSessionCookie(updatedUser, 7);
      router.refresh();
    },
    [user, router]
  );

  const isAdmin = user?.role === "ADMIN";
  const isViewer = user?.role === "VIEWER";

  const value = React.useMemo(
    () => ({
      user,
      session,
      isLoading,
      isAdmin,
      isViewer,
      signIn,
      signUp,
      signOut,
      resetPassword,
      switchRole,
    }),
    [user, session, isLoading, isAdmin, isViewer, signIn, signUp, signOut, resetPassword, switchRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
