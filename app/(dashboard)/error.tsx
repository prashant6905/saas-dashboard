"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Dashboard route render error:", error);
  }, [error]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4 text-center p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="space-y-1.5 max-w-md">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Failed to load dashboard data
        </h2>
        <p className="text-sm text-muted-foreground">
          An error occurred while calculating analytics or loading live telemetry.
        </p>
        {error.message && (
          <p className="text-xs font-mono text-muted-foreground bg-muted/60 p-2 rounded mt-2 text-left overflow-x-auto">
            {error.message}
          </p>
        )}
      </div>
      <Button onClick={() => reset()} variant="outline" size="sm" className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />
        Retry Operation
      </Button>
    </div>
  );
}
