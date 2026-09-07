"use client";

import * as React from "react";
import { Download, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthorization } from "@/lib/auth/use-authorization";
import { ExportFilterOptions, ExportType } from "@/lib/export/generate-csv";

interface ExportButtonProps {
  type: ExportType;
  options?: ExportFilterOptions;
  label?: string;
  className?: string;
  variant?: "outline" | "default" | "secondary";
  size?: "sm" | "default";
}

export function ExportButton({
  type,
  options,
  label = "Export CSV",
  className,
  variant = "outline",
  size = "sm",
}: ExportButtonProps) {
  const { can } = useAuthorization();
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isAllowed = can("data:export");

  const handleExport = async () => {
    if (!isAllowed) {
      setError("Forbidden: Viewer role does not have permission to export data.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, ...options }),
      });

      if (!response.ok) {
        let errMessage = "Export failed";
        try {
          const body = await response.json();
          errMessage = body.error || errMessage;
        } catch {
          errMessage = `Server error (HTTP ${response.status})`;
        }
        throw new Error(errMessage);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
      const filename =
        filenameMatch?.[1] ||
        `command-center-${type}-${new Date().toISOString().substring(0, 10)}.csv`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isAllowed) {
    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block cursor-not-allowed">
              <Button
                variant={variant}
                size={size}
                disabled
                className={`gap-2 text-xs opacity-60 pointer-events-none ${className || ""}`}
                aria-label="Export restricted to Administrator role"
              >
                <Lock
                  className={`h-3.5 w-3.5 ${
                    variant === "default"
                      ? "text-primary-foreground"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                />
                <span>{label}</span>
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-xs">
            <p className="font-semibold text-rose-400">Export Restricted</p>
            <p className="text-slate-300 text-[11px]">
              Viewer accounts cannot export workspace telemetry. Administrator role required.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="relative inline-flex flex-col">
      <Button
        variant={variant}
        size={size}
        onClick={handleExport}
        disabled={isExporting}
        className={`gap-2 text-xs font-medium ${className || ""}`}
        aria-label={`Export ${type} data to CSV`}
      >
        {isExporting ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Exporting…</span>
          </>
        ) : (
          <>
            <Download className="h-3.5 w-3.5" />
            <span>{label}</span>
          </>
        )}
      </Button>
      {error && (
        <span className="absolute top-full left-0 mt-1 whitespace-nowrap rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-500">
          {error}
        </span>
      )}
    </div>
  );
}
