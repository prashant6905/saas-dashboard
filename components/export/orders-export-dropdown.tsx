"use client";

import * as React from "react";
import { Download, Lock, Loader2, ChevronDown, FileSpreadsheet, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthorization } from "@/lib/auth/use-authorization";
import {
  downloadCSV,
  generateCSV,
  ORDERS_CSV_COLUMNS,
  type OrderExportRecord,
} from "@/lib/export/csv-exporter";
import type { OrderTableRow } from "@/types/orders-table";

interface OrdersExportDropdownProps {
  currentPageRecords: OrderTableRow[];
  allFilteredRecords: OrderTableRow[];
  className?: string;
  variant?: "outline" | "default" | "secondary";
  size?: "sm" | "default";
}

export function OrdersExportDropdown({
  currentPageRecords,
  allFilteredRecords,
  className,
  variant = "outline",
  size = "sm",
}: OrdersExportDropdownProps) {
  const { can } = useAuthorization();
  const [isExporting, setIsExporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isAllowed = can("data:export");

  const mapToExportRecords = (rows: OrderTableRow[]): OrderExportRecord[] => {
    return rows.map((r) => ({
      id: r.id,
      customerName: r.customerName,
      customerEmail: r.customerEmail,
      customerSegment: r.customerSegment,
      createdAt: r.createdAt,
      region: r.region,
      totalAmount: r.totalAmount,
      status: r.status,
      itemCount: r.itemCount,
      categoryNames: r.categoryNames,
    }));
  };

  const handleExport = (scope: "current-page" | "all-filtered") => {
    if (!isAllowed) {
      setError("Forbidden: Viewer role does not have permission to export data.");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const recordsToExport =
        scope === "current-page"
          ? mapToExportRecords(currentPageRecords)
          : mapToExportRecords(allFilteredRecords);

      const timestamp = new Date().toISOString().substring(0, 10);
      const filename =
        scope === "current-page"
          ? `command-center-orders-page-${timestamp}.csv`
          : `command-center-orders-filtered-${timestamp}.csv`;

      const csvContent = generateCSV(recordsToExport, ORDERS_CSV_COLUMNS);
      downloadCSV(filename, csvContent);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate CSV export");
    } finally {
      setIsExporting(false);
    }
  };

  // 1. Viewer Role: Show locked, disabled state with explanatory tooltip
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
                <span>Export CSV</span>
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

  // 2. Admin Role: Interactive Dropdown Menu with Export Options
  return (
    <div className="relative inline-flex flex-col">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            disabled={isExporting}
            className={`gap-1.5 text-xs font-medium ${className || ""}`}
            aria-label="Export orders to CSV options"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Exporting…</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 text-xs">
          <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Export Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Option 1: Current Page */}
          <DropdownMenuItem
            onClick={() => handleExport("current-page")}
            className="cursor-pointer flex flex-col items-start gap-0.5 py-2"
          >
            <div className="flex items-center gap-2 font-medium text-foreground w-full">
              <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
              <span>Current Page</span>
              <span className="ml-auto text-[11px] font-mono text-muted-foreground">
                {currentPageRecords.length} records
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground pl-5.5">
              Exports the {currentPageRecords.length} records currently shown in table view
            </p>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Option 2: All Filtered Results */}
          <DropdownMenuItem
            onClick={() => handleExport("all-filtered")}
            className="cursor-pointer flex flex-col items-start gap-0.5 py-2"
          >
            <div className="flex items-center gap-2 font-medium text-foreground w-full">
              <Layers className="h-3.5 w-3.5 text-emerald-500" />
              <span>All Filtered Results</span>
              <span className="ml-auto text-[11px] font-mono text-muted-foreground">
                {allFilteredRecords.length} records
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground pl-5.5">
              Exports all {allFilteredRecords.length.toLocaleString()} records matching active filters
            </p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <span className="absolute top-full right-0 mt-1 whitespace-nowrap rounded border border-rose-500/40 bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-500 z-50 shadow-sm">
          {error}
        </span>
      )}
    </div>
  );
}
