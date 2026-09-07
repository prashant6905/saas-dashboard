import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-commandcenter.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-commandcenter-anon-key";

import { verifySessionToken } from "@/lib/auth/session-crypto";
import type { User } from "@supabase/supabase-js";

// Protected application routes
const PROTECTED_ROUTES = [
  "/dashboard",
  "/analytics",
  "/orders",
  "/products",
  "/customers",
  "/settings",
];

// Public authentication routes
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Check Supabase session
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  // Fallback demo session cookie for local/offline workflows
  let userRole: "ADMIN" | "VIEWER" = "VIEWER";

  if (!user) {
    const demoSessionCookie = request.cookies.get("cc_auth_session")?.value;
    if (demoSessionCookie) {
      const verified = await verifySessionToken(decodeURIComponent(demoSessionCookie));
      if (verified) {
        userRole = verified.role;
        user = {
          id: verified.id,
          app_metadata: {},
          user_metadata: { full_name: verified.name, role: verified.role },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          email: verified.email,
        } as unknown as User;
      }
    }
  } else {
    const rawRole = (user.user_metadata?.role || "").toUpperCase();
    userRole = (rawRole === "ADMIN" || rawRole === "ADMINISTRATOR") ? "ADMIN" : "VIEWER";
  }

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAdminRoute = pathname === "/settings" || pathname.startsWith("/settings/");

  // 1. Root route redirect
  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = user ? "/dashboard" : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // 2. Unauthenticated user trying to access protected route -> redirect to /login
  if (!user && isProtected) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. Authenticated user trying to access login/signup/forgot-password -> redirect to /dashboard
  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Role-based route protection: VIEWER trying to access admin-only route (/settings) -> redirect with error
  if (user && isAdminRoute && userRole !== "ADMIN") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.searchParams.set("error", "admin_required");
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
