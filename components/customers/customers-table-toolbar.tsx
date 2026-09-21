"use client";

import * as React from "react";
import {
  ChevronDown,
  FilterX,
  Globe,
  Search,
  UserCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CustomerSegment, Region } from "@/types/ecommerce";
import type { CustomersTableFilters } from "@/types/customers-table";

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

const SEGMENT_OPTIONS: Array<CustomerSegment | "all"> = [
  "all",
  "New",
  "Returning",
  "VIP",
  "At Risk",
];

interface CustomersTableToolbarProps {
  filters: CustomersTableFilters;
  onSearchChange: (val: string) => void;
  onRegionChange: (val: Region | "all") => void;
  onSegmentChange: (val: CustomerSegment | "all") => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  className?: string;
}

export function CustomersTableToolbar({
  filters,
  onSearchChange,
  onRegionChange,
  onSegmentChange,
  onClearFilters,
  activeFilterCount,
  className,
}: CustomersTableToolbarProps) {
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <form
            role="search"
            aria-label="Customer search"
            onSubmit={handleSearchSubmit}
            className="relative flex items-center min-w-[240px] max-w-sm w-full sm:w-auto"
          >
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600 dark:text-slate-400 pointer-events-none" />
            <input
              type="search"
              aria-label="Search customers by name, email, or ID"
              placeholder="Search customer name, email, ID..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onBlur={() => onSearchChange(searchValue)}
              className="h-8 w-full rounded-lg border border-border/70 bg-card/70 pl-8 pr-8 text-xs text-foreground placeholder:text-[#64748B] dark:placeholder:text-[#94A3B8] focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20 shadow-2xs transition-colors"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 hover:text-foreground"
                aria-label="Clear search input"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>

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
                aria-label="Filter by geographic region"
              >
                <Globe className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>
                  {filters.region === "all" ? "Region: All" : filters.region}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel className="text-xs">
                Filter by Region
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.region}
                onValueChange={(val) =>
                  onRegionChange(val as Region | "all")
                }
              >
                <DropdownMenuRadioItem value="all" className="text-xs">
                  All Regions
                </DropdownMenuRadioItem>
                {REGION_OPTIONS.filter((r) => r !== "all").map((reg) => (
                  <DropdownMenuRadioItem
                    key={reg}
                    value={reg}
                    className="text-xs"
                  >
                    {reg}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Customer Segment Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-normal rounded-lg border-border/70 bg-card/70 hover:bg-card hover:border-border text-foreground shadow-2xs transition-all",
                  filters.segment !== "all" &&
                    "border-primary/30 bg-primary/10 text-primary font-medium hover:bg-primary/15"
                )}
                aria-label="Filter by customer segment"
              >
                <UserCheck className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>
                  {filters.segment === "all"
                    ? "Segment: All"
                    : `Segment: ${filters.segment}`}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel className="text-xs">
                Customer Segment
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.segment}
                onValueChange={(val) =>
                  onSegmentChange(val as CustomerSegment | "all")
                }
              >
                <DropdownMenuRadioItem value="all" className="text-xs">
                  All Segments
                </DropdownMenuRadioItem>
                {SEGMENT_OPTIONS.filter((s) => s !== "all").map((seg) => (
                  <DropdownMenuRadioItem
                    key={seg}
                    value={seg}
                    className="text-xs"
                  >
                    {seg}
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
            >
              <FilterX className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
              <span>Clear filters</span>
              <Badge
                variant="secondary"
                className="ml-1 h-4 px-1.5 text-[10px] font-mono bg-muted/80 text-foreground"
              >
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
