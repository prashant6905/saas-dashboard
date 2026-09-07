import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthUser, Role, Permission } from "@/types/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-commandcenter.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-commandcenter-anon-key";

const COOKIE_NAME = "cc_auth_session";

import { verifySessionToken } from "@/lib/auth/session-crypto";

/**
 * Retrieve authenticated user on the server (handles both request cookies & next/headers).
 */
export async function getServerAuthUser(request?: NextRequest): Promise<AuthUser | null> {
  // 1. Try NextRequest cookies if provided
  if (request) {
    const rawCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (rawCookie) {
      const verified = await verifySessionToken(decodeURIComponent(rawCookie));
      if (verified) {
        return verified;
      }
    }
  }

  // 2. Try next/headers cookies
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get(COOKIE_NAME)?.value;
    if (rawCookie) {
      const verified = await verifySessionToken(decodeURIComponent(rawCookie));
      if (verified) {
        return verified;
      }
    }

    // 3. Check Supabase session via SSR client
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Readonly in Server Components
          }
        },
      },
    });

    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const u = data.user;
      const role = (
        u.user_metadata?.role?.toUpperCase() === "ADMIN" ||
        u.user_metadata?.role?.toUpperCase() === "ADMINISTRATOR"
          ? "ADMIN"
          : "VIEWER"
      ) as Role;
      return {
        id: u.id,
        email: u.email || "",
        name: (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "User",
        role,
      };
    }
  } catch {
    // cookies() unavailable in some edge contexts
  }

  return null;
}

export type ServerAuthResult =
  | { authorized: true; user: AuthUser }
  | { authorized: false; response: NextResponse };

/**
 * Server-side authorization gate for API routes.
 * Enforces authentication and specific permission.
 */
export async function requirePermission(
  request: NextRequest,
  permission: Permission
): Promise<ServerAuthResult> {
  const user = await getServerAuthUser(request);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "Unauthorized: Authentication required to access this resource.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(user.role, permission)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: `Forbidden: ${user.role} role does not have permission '${permission}'.`,
          code: "FORBIDDEN",
          requiredPermission: permission,
          userRole: user.role,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Server-side authorization gate for specific role.
 */
export async function requireRole(
  request: NextRequest,
  requiredRole: Role
): Promise<ServerAuthResult> {
  const user = await getServerAuthUser(request);

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "Unauthorized: Authentication required.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== requiredRole) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: `Forbidden: ${user.role} role is not permitted. Requires ${requiredRole}.`,
          code: "FORBIDDEN",
          requiredRole,
          userRole: user.role,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}
