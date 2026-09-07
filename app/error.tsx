"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Command Center Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6 rounded-xl border border-border bg-card p-8 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected system exception occurred while rendering this view.
            </p>
            {error.message && (
              <div className="mt-3 rounded-md bg-muted/60 p-2.5 text-xs font-mono text-muted-foreground text-left overflow-x-auto">
                {error.message}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button
              onClick={() => reset()}
              variant="default"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard" className="gap-2">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
