"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  FilterX,
  Layers,
  MapPin,
  RefreshCw,
  Tag,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SEED_DATA } from "@/lib/data/seed-data";
import type { CustomerSegment, OrderStatus, Region } from "@/types/ecommerce";
import type { DashboardFilters, DatePresetKey } from "@/lib/filters/types";
import {
  formatRangeDateLabel,
  getFilterDateRange,
} from "@/lib/filters/date-ranges";

const DATE_OPTIONS: Array<{ key: DatePresetKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "12m", label: "Last 12 months" },
  { key: "custom", label: "Custom range..." },
];

const REGION_OPTIONS: Array<Region | "all"> = [
  "all",
  "Maharashtra",
  "Karnataka",
  "Delhi",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Kerala",
];

const STATUS_OPTIONS: Array<OrderStatus | "all"> = [
  "all",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const SEGMENT_OPTIONS: Array<CustomerSegment | "all"> = [
  "all",
  "New",
  "Returning",
  "VIP",
  "At Risk",
];

interface DashboardFilterToolbarProps {
  filters: DashboardFilters;
  onSetDateRange: (
    preset: DatePresetKey,
    customStart?: string,
    customEnd?: string
  ) => void;
  onSetRegion: (region: Region | "all") => void;
  onSetCategory: (category: string | "all") => void;
  onSetStatus: (status: OrderStatus | "all") => void;
  onSetSegment: (segment: CustomerSegment | "all") => void;
  onClearFilters: () => void;
  onRemoveFilter: (key: keyof DashboardFilters) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeCount: number;
  className?: string;
}

export function DashboardFilterToolbar({
  filters,
  onSetDateRange,
  onSetRegion,
  onSetCategory,
  onSetStatus,
  onSetSegment,
  onClearFilters,
  onRemoveFilter,
  onRefresh,
  isRefreshing = false,
  activeCount,
  className,
}: DashboardFilterToolbarProps) {
  const currentRange = React.useMemo(() => {
    return getFilterDateRange(
      filters.range,
      filters.customStart,
      filters.customEnd
    );
  }, [filters.range, filters.customStart, filters.customEnd]);

  // Local state for custom date inputs
  const [customFrom, setCustomFrom] = React.useState<string>(
    filters.customStart ? filters.customStart.substring(0, 10) : "2026-08-01"
  );
  const [customTo, setCustomTo] = React.useState<string>(
    filters.customEnd ? filters.customEnd.substring(0, 10) : "2026-09-01"
  );

  // Selected Category Name
  const selectedCategoryName = React.useMemo(() => {
    if (filters.category === "all") return "All categories";
    const cat = SEED_DATA.categories.find((c) => c.id === filters.category);
    return cat ? cat.name : "All categories";
  }, [filters.category]);

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFrom && customTo) {
      onSetDateRange("custom", customFrom, customTo);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div
          role="toolbar"
          aria-label="Dashboard filter toolbar"
          className="flex flex-wrap items-center gap-1.5"
        >
          {/* 1. Date Range Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-medium transition-all rounded-xl border border-border/80 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground shadow-2xs",
                  filters.range !== "30d" &&
                    "border-foreground/30 bg-neutral-100 dark:bg-neutral-800 font-semibold"
                )}
                aria-label="Filter by date range"
              >
                <CalendarIcon className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>
                  Date:{" "}
                  <strong className="font-semibold text-foreground">
                    {currentRange.label}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Time Horizon</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.range}
                onValueChange={(val) => onSetDateRange(val as DatePresetKey)}
              >
                {DATE_OPTIONS.map((opt) => (
                  <DropdownMenuRadioItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 2. Region Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-medium transition-all rounded-xl border border-border/80 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground shadow-2xs",
                  filters.region !== "all" &&
                    "border-foreground/30 bg-neutral-100 dark:bg-neutral-800 font-semibold"
                )}
                aria-label="Filter by Indian state or region"
              >
                <MapPin className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>
                  State:{" "}
                  <strong className="font-semibold text-foreground">
                    {filters.region === "all" ? "All" : filters.region}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 max-h-72 overflow-y-auto">
              <DropdownMenuLabel>State / Region</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.region}
                onValueChange={(val) => onSetRegion(val as Region | "all")}
              >
                {REGION_OPTIONS.map((reg) => (
                  <DropdownMenuRadioItem key={reg} value={reg}>
                    {reg === "all" ? "All regions" : reg}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 3. Category Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-medium transition-all rounded-xl border border-border/80 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground shadow-2xs max-w-[200px] truncate",
                  filters.category !== "all" &&
                    "border-foreground/30 bg-neutral-100 dark:bg-neutral-800 font-semibold"
                )}
                aria-label="Filter by merchandise category"
              >
                <Layers className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span className="truncate">
                  Category:{" "}
                  <strong className="font-semibold text-foreground">
                    {filters.category === "all" ? "All" : selectedCategoryName}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
              <DropdownMenuLabel>Merchandise Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.category}
                onValueChange={(val) => onSetCategory(val)}
              >
                <DropdownMenuRadioItem value="all">
                  All categories
                </DropdownMenuRadioItem>
                {SEED_DATA.categories.map((cat) => (
                  <DropdownMenuRadioItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 4. Order Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-medium transition-all rounded-xl border border-border/80 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground shadow-2xs",
                  filters.status !== "all" &&
                    "border-foreground/30 bg-neutral-100 dark:bg-neutral-800 font-semibold"
                )}
                aria-label="Filter by order status"
              >
                <Tag className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>
                  Status:{" "}
                  <strong className="font-semibold text-foreground">
                    {filters.status === "all" ? "All" : filters.status}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>Order Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.status}
                onValueChange={(val) => onSetStatus(val as OrderStatus | "all")}
              >
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {status === "all" ? "All statuses" : status}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 5. Customer Segment Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-medium transition-all rounded-xl border border-border/80 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground shadow-2xs",
                  filters.segment !== "all" &&
                    "border-foreground/30 bg-neutral-100 dark:bg-neutral-800 font-semibold"
                )}
                aria-label="Filter by customer segment"
              >
                <Users className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300 shrink-0" />
                <span>
                  Segment:{" "}
                  <strong className="font-semibold text-foreground">
                    {filters.segment === "all" ? "All" : filters.segment}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>Customer Segment</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.segment}
                onValueChange={(val) => onSetSegment(val as CustomerSegment | "all")}
              >
                {SEGMENT_OPTIONS.map((segment) => (
                  <DropdownMenuRadioItem key={segment} value={segment}>
                    {segment === "all" ? "All segments" : segment}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 gap-1.5 px-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              aria-label="Clear all active filters"
            >
              <FilterX className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
              <span>Clear filters</span>
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[10px] font-mono leading-none bg-muted/80 text-foreground"
              >
                {activeCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Date Span Readout & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/70 px-3 py-1 text-xs text-slate-700 dark:text-slate-300 shadow-2xs">
            <CalendarIcon className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
            <span className="font-mono text-[11px]">
              {formatRangeDateLabel(currentRange.startDate)} –{" "}
              {formatRangeDateLabel(currentRange.endDate)}
            </span>
          </div>

          {onRefresh && (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 rounded-lg border-border/70 bg-card/70 hover:bg-card text-slate-700 dark:text-slate-300 hover:text-foreground shadow-2xs"
              aria-label="Refresh dashboard metrics"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5 text-slate-700 dark:text-slate-300", isRefreshing && "animate-spin")}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Custom Date Input Strip (if range === "custom") */}
      {filters.range === "custom" && (
        <form
          onSubmit={handleApplyCustomDates}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-2 text-xs"
        >
          <span className="font-medium text-foreground">Custom Date Horizon:</span>
          <div className="flex items-center gap-1.5">
            <label htmlFor="custom-from" className="text-muted-foreground text-[11px]">
              From:
            </label>
            <input
              id="custom-from"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-7 rounded border border-border bg-background px-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label htmlFor="custom-to" className="text-muted-foreground text-[11px]">
              To:
            </label>
            <input
              id="custom-to"
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-7 rounded border border-border bg-background px-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <Button type="submit" size="sm" className="h-7 px-3 text-xs">
            Apply Dates
          </Button>
        </form>
      )}

      {/* Active Filter Badges Strip */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] text-muted-foreground font-medium">
            Active filters:
          </span>

          {filters.range !== "30d" && (
            <Badge
              variant="outline"
              className="h-6 gap-1.5 rounded-lg border-border/80 bg-card/90 text-foreground text-[11px] font-medium px-2 shadow-2xs"
            >
              <span>Time: {currentRange.label}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("range")}
                className="hover:text-destructive text-muted-foreground transition-colors"
                aria-label="Remove date range filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.region !== "all" && (
            <Badge
              variant="outline"
              className="h-6 gap-1.5 rounded-lg border-border/80 bg-card/90 text-foreground text-[11px] font-medium px-2 shadow-2xs"
            >
              <span>State: {filters.region}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("region")}
                className="hover:text-destructive text-muted-foreground transition-colors"
                aria-label="Remove state filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.category !== "all" && (
            <Badge
              variant="outline"
              className="h-6 gap-1.5 rounded-lg border-border/80 bg-card/90 text-foreground text-[11px] font-medium px-2 shadow-2xs"
            >
              <span>Category: {selectedCategoryName}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("category")}
                className="hover:text-destructive text-muted-foreground transition-colors"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.status !== "all" && (
            <Badge
              variant="outline"
              className="h-6 gap-1.5 rounded-lg border-border/80 bg-card/90 text-foreground text-[11px] font-medium px-2 shadow-2xs"
            >
              <span>Status: {filters.status}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("status")}
                className="hover:text-destructive text-muted-foreground transition-colors"
                aria-label="Remove status filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.segment !== "all" && (
            <Badge
              variant="outline"
              className="h-6 gap-1.5 rounded-lg border-border/80 bg-card/90 text-foreground text-[11px] font-medium px-2 shadow-2xs"
            >
              <span>Segment: {filters.segment}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter("segment")}
                className="hover:text-destructive text-muted-foreground transition-colors"
                aria-label="Remove segment filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
