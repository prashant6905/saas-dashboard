"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Send,
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

function ForgotPasswordForm() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPassword(email);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setErrorMessage("Could not process password reset. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-border/75 bg-card/90 shadow-soft-lg backdrop-blur-xl overflow-hidden">
      <CardHeader className="space-y-1.5 border-b border-border/40 bg-muted/10 pb-5 pt-6 px-6">
        <CardTitle className="text-xl font-bold tracking-tight text-foreground">
          Reset Password
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Enter your registered email address to receive password recovery instructions.
        </CardDescription>
      </CardHeader>

      {isSubmitted ? (
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-700 dark:text-emerald-400 shadow-2xs">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Reset Link Dispatched</p>
              <p className="text-muted-foreground">
                We have sent instructions to{" "}
                <span className="font-medium text-foreground">{email}</span>. Please
                check your inbox or spam folder.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 font-medium text-xs rounded-lg h-9 shadow-2xs"
            onClick={() => setIsSubmitted(false)}
          >
            Try another email
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 p-6">
            {/* Error Alert */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-400 shadow-2xs animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="reset-email"
                className="text-xs font-semibold text-foreground/90"
              >
                Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/70" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-border/70 bg-card/70 py-2.5 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 shadow-2xs focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 px-6 pb-6 pt-0">
            <Button
              type="submit"
              className="w-full gap-2 font-semibold text-xs h-10 rounded-lg shadow-2xs bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Sending link...
                </span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Recovery Instructions</span>
                </>
              )}
            </Button>

            <div className="text-center pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function ForgotPasswordPage() {
  return (
    <React.Suspense fallback={<div className="h-72 w-full" />}>
      <ForgotPasswordForm />
    </React.Suspense>
  );
}
