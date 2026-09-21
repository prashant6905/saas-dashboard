"use client";

import * as React from "react";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type DatePresetKey = "7d" | "30d" | "90d" | "12m";

export interface DateFilterRange {
  preset: DatePresetKey;
  startDate: string;
  endDate: string;
  label: string;
  comparisonLabel: string;
}

// Anchor date matching the dataset horizon
const DATASET_ANCHOR = new Date("2026-09-01T23:59:59.000Z");

export function getDateFilterRange(preset: DatePresetKey): DateFilterRange {
  const end = new Date(DATASET_ANCHOR);
  const start = new Date(DATASET_ANCHOR);

  switch (preset) {
    case "7d":
      start.setDate(end.getDate() - 7);
      return {
        preset,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 7 Days",
        comparisonLabel: "vs prior 7 days",
      };
    case "30d":
      start.setDate(end.getDate() - 30);
      return {
        preset,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 30 Days",
        comparisonLabel: "vs prior 30 days",
      };
    case "90d":
      start.setDate(end.getDate() - 90);
      return {
        preset,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 90 Days",
        comparisonLabel: "vs prior 90 days",
      };
    case "12m":
      start.setFullYear(end.getFullYear() - 1);
      return {
        preset,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 12 Months",
        comparisonLabel: "vs prior year",
      };
  }
}

interface DateFilterBarProps {
  selectedPreset: DatePresetKey;
  onSelectPreset: (preset: DatePresetKey) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export function DateFilterBar({
  selectedPreset,
  onSelectPreset,
  onRefresh,
  isRefreshing = false,
  className,
}: DateFilterBarProps) {
  const currentRange = getDateFilterRange(selectedPreset);

  const formatDateLabel = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Preset Buttons */}
      <div
        role="group"
        aria-label="Date range selection"
        className="inline-flex rounded-lg border border-border/60 bg-secondary/30 p-0.5"
      >
        {(["7d", "30d", "90d", "12m"] as DatePresetKey[]).map((preset) => {
          const isActive = selectedPreset === preset;
          const label =
            preset === "7d"
              ? "7D"
              : preset === "30d"
              ? "30D"
              : preset === "90d"
              ? "90D"
              : "12M";

          return (
            <button
              key={preset}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                isActive ? "bg-background text-[#111827] dark:text-[#F8FAFC] shadow-2xs font-semibold" : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#111827] dark:hover:text-[#F8FAFC] hover:bg-secondary/60"
              )}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Date Span Indicator & Refresh Button */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/50 px-2.5 py-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground/70" />
          <span className="font-mono text-[11px]">
            {formatDateLabel(currentRange.startDate)} –{" "}
            {formatDateLabel(currentRange.endDate)}
          </span>
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
            />
          </Button>
        )}
      </div>
    </div>
  );
}
