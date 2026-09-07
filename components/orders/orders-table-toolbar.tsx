"use client";

import * as React from "react";
import {
  Calendar,
  Check,
  ChevronDown,
  FilterX,
  MapPin,
  Package,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SEED_DATA } from "@/lib/data/seed-data";
import { OrdersExportDropdown } from "@/components/export/orders-export-dropdown";
import type { OrderStatus, Region } from "@/types/ecommerce";
import type { DatePresetKey } from "@/lib/filters/types";
import type { OrdersTableFilters } from "@/types/orders-table";
import type { Table } from "@tanstack/table-core";
import type { OrderTableRow } from "@/types/orders-table";

const STATUS_OPTIONS: Array<OrderStatus | "all"> = [
  "all",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
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

const DATE_OPTIONS: Array<{ key: DatePresetKey | "all"; label: string }> = [
  { key: "all", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "90d", label: "Last 90 days" },
  { key: "12m", label: "Last 12 months" },
];

interface OrdersTableToolbarProps {
  filters: OrdersTableFilters;
  onSearchChange: (val: string) => void;
  onStatusChange: (val: OrderStatus | "all") => void;
  onRegionChange: (val: Region | "all") => void;
  onCategoryChange: (val: string | "all") => void;
  onRangeChange: (val: DatePresetKey | "all") => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  table: Table<OrderTableRow>;
  selectedCount: number;
  onClearSelection: () => void;
  currentPageRecords?: OrderTableRow[];
  allFilteredRecords?: OrderTableRow[];
  className?: string;
}

export function OrdersTableToolbar({
  filters,
  onSearchChange,
  onStatusChange,
  onRegionChange,
  onCategoryChange,
  onRangeChange,
  onClearFilters,
  activeFilterCount,
  table,
  selectedCount,
  onClearSelection,
  currentPageRecords,
  allFilteredRecords,
  className,
}: OrdersTableToolbarProps) {
  const [searchValue, setSearchValue] = React.useState(filters.search);
  const [prevSearch, setPrevSearch] = React.useState(filters.search);

  if (filters.search !== prevSearch) {
    setPrevSearch(filters.search);
    setSearchValue(filters.search);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchValue);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    onSearchChange("");
  };

  return (
    <div className={cn("space-y-3 p-4", className)}>
      {/* Top Filter Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <form
            role="search"
            aria-label="Order search"
            onSubmit={handleSearchSubmit}
            className="relative flex items-center min-w-[220px] max-w-xs w-full sm:w-auto"
          >
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search orders by ID, customer name, or email"
              placeholder="Search ID, customer, email..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onBlur={() => onSearchChange(searchValue)}
              className="h-8 w-full rounded-lg border border-border/70 bg-card/70 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 shadow-2xs transition-colors"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 text-slate-600 dark:text-slate-400 hover:text-foreground"
                aria-label="Clear search input"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-normal rounded-lg border-border/70 bg-card/70 hover:bg-card hover:border-border text-foreground shadow-2xs transition-all",
                  filters.status !== "all" &&
                    "border-primary/30 bg-primary/10 text-primary font-medium hover:bg-primary/15"
                )}
                aria-label="Filter orders by status"
              >
                <Tag className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
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
                onValueChange={(val) => onStatusChange(val as OrderStatus | "all")}
              >
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {status === "all" ? "All statuses" : status}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Region Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-normal rounded-lg border-border/70 bg-card/70 hover:bg-card hover:border-border text-foreground shadow-2xs transition-all",
                  filters.region !== "all" &&
                    "border-primary/30 bg-primary/10 text-primary font-medium hover:bg-primary/15"
                )}
                aria-label="Filter orders by state"
              >
                <MapPin className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
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
                onValueChange={(val) => onRegionChange(val as Region | "all")}
              >
                {REGION_OPTIONS.map((reg) => (
                  <DropdownMenuRadioItem key={reg} value={reg}>
                    {reg === "all" ? "All states" : reg}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-normal rounded-lg border-border/70 bg-card/70 hover:bg-card hover:border-border text-foreground shadow-2xs transition-all",
                  filters.category !== "all" &&
                    "border-primary/30 bg-primary/10 text-primary font-medium hover:bg-primary/15"
                )}
                aria-label="Filter orders by product category"
              >
                <Package className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>
                  Category:{" "}
                  <strong className="font-semibold text-foreground">
                    {filters.category === "all" ? "All" : filters.category}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
              <DropdownMenuLabel>Product Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.category}
                onValueChange={(val) => onCategoryChange(val)}
              >
                <DropdownMenuRadioItem value="all">
                  All categories
                </DropdownMenuRadioItem>
                {SEED_DATA.categories.map((cat) => (
                  <DropdownMenuRadioItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-normal rounded-lg border-border/70 bg-card/70 hover:bg-card hover:border-border text-foreground shadow-2xs transition-all",
                  filters.range !== "all" &&
                    "border-primary/30 bg-primary/10 text-primary font-medium hover:bg-primary/15"
                )}
                aria-label="Filter orders by date"
              >
                <Calendar className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>
                  Date:{" "}
                  <strong className="font-semibold text-foreground">
                    {DATE_OPTIONS.find((d) => d.key === filters.range)?.label ??
                      "All Time"}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>Date Window</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.range}
                onValueChange={(val) =>
                  onRangeChange(val as DatePresetKey | "all")
                }
              >
                {DATE_OPTIONS.map((opt) => (
                  <DropdownMenuRadioItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 gap-1.5 px-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              aria-label="Clear all active order filters"
            >
              <FilterX className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
              <span>Clear filters</span>
              <Badge
                variant="secondary"
                className="h-4 px-1.5 text-[10px] font-mono leading-none bg-muted/80 text-foreground"
              >
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Right side: Export Dropdown & Column Visibility Toggle */}
        <div className="flex items-center gap-2">
          {currentPageRecords && allFilteredRecords && (
            <OrdersExportDropdown
              currentPageRecords={currentPageRecords}
              allFilteredRecords={allFilteredRecords}
              size="sm"
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 px-3 text-xs rounded-lg border-border/70 bg-card/70 hover:bg-card text-foreground shadow-2xs"
                aria-label="Customize visible columns"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>Columns</span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (col) =>
                    typeof col.accessorFn !== "undefined" && col.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(val) => column.toggleVisibility(!!val)}
                    >
                      {column.id === "createdAt"
                        ? "Date"
                        : column.id === "customerName"
                        ? "Customer"
                        : column.id === "totalAmount"
                        ? "Amount"
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Selected Rows Announcement Banner */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-semibold">
              <Check className="h-2.5 w-2.5" />
            </span>
            <span className="font-medium text-foreground">
              {selectedCount} order(s) selected
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </Button>
        </div>
      )}
    </div>
  );
}
