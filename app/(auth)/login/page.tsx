"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const { signIn } = useAuth();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn(email, password, rememberMe);
      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        setSuccessMessage("Session verified. Redirecting to workspace...");
        setTimeout(() => {
          router.push(redirectTarget);
          router.refresh();
        }, 400);
      }
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail("admin@commandcenter.io");
    setPassword("Password123!");
    setErrorMessage(null);
  };

  const fillViewerCredentials = () => {
    setEmail("viewer@commandcenter.io");
    setPassword("Password123!");
    setErrorMessage(null);
  };

  return (
    <Card className="rounded-2xl border-border/75 bg-card/90 shadow-soft-lg backdrop-blur-xl overflow-hidden">
      <CardHeader className="space-y-1.5 pb-4 border-b border-border/40 bg-muted/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold tracking-tight">
            Sign In
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-2xs"
              title="Auto-fill Administrator credentials"
            >
              <Sparkles className="h-3 w-3" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={fillViewerCredentials}
              className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/20 transition-all shadow-2xs"
              title="Auto-fill Viewer credentials"
            >
              <Sparkles className="h-3 w-3" />
              <span>Viewer</span>
            </button>
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your authorized credentials to access your D2C analytics suite.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400 animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="flex items-start gap-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in-50">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="text-xs font-medium text-foreground flex items-center justify-between"
            >
              <span>Email Address</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-lg border border-border/70 bg-card/70 py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 shadow-2xs transition-colors"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label
                htmlFor="login-password"
                className="font-medium text-foreground"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[#64748B] dark:text-[#94A3B8] hover:text-primary transition-colors text-[11px]"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-border/70 bg-card/70 py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 shadow-2xs transition-colors"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary"
            />
            <label
              htmlFor="remember-me"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Remember session for 30 days
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Button
            type="submit"
            className="w-full gap-2 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Authenticating...
              </span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </Button>

          <div className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              Create Account
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="h-72 w-full" />}>
      <LoginForm />
    </React.Suspense>
  );
}
