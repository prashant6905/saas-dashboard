"use client";

import * as React from "react";
import {
  Boxes,
  ChevronDown,
  FilterX,
  Layers,
  Search,
  Sparkles,
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
import { SEED_DATA } from "@/lib/data/seed-data";
import type {
  ProductPerformance,
  ProductsTableFilters,
  StockStatus,
} from "@/types/products-table";

const STOCK_STATUS_OPTIONS: Array<StockStatus | "all"> = [
  "all",
  "In Stock",
  "Low Stock",
  "Out of Stock",
];

const PERFORMANCE_OPTIONS: Array<ProductPerformance | "all"> = [
  "all",
  "Top Performer",
  "Strong",
  "Average",
  "Underperforming",
];

interface ProductsTableToolbarProps {
  filters: ProductsTableFilters;
  onSearchChange: (val: string) => void;
  onCategoryChange: (val: string | "all") => void;
  onStockChange: (val: StockStatus | "all") => void;
  onPerformanceChange: (val: ProductPerformance | "all") => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  className?: string;
}

export function ProductsTableToolbar({
  filters,
  onSearchChange,
  onCategoryChange,
  onStockChange,
  onPerformanceChange,
  onClearFilters,
  activeFilterCount,
  className,
}: ProductsTableToolbarProps) {
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

  const currentCategoryLabel =
    filters.category === "all"
      ? "All Categories"
      : SEED_DATA.categories.find((c) => c.id === filters.category)?.name ??
        filters.category;

  return (
    <div className={cn("space-y-3 p-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <form
            role="search"
            aria-label="Product search"
            onSubmit={handleSearchSubmit}
            className="relative flex items-center min-w-[220px] max-w-xs w-full sm:w-auto"
          >
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-600 dark:text-slate-400" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search products by title, SKU, or category"
              placeholder="Search product, SKU, category..."
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
                aria-label="Clear product search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </form>

          {/* Category Dropdown Filter */}
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
                aria-label="Filter products by category"
              >
                <Layers className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>
                  Category:{" "}
                  <strong className="font-semibold text-foreground">
                    {currentCategoryLabel}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 max-h-72 overflow-y-auto">
              <DropdownMenuLabel>Merchandise Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.category}
                onValueChange={(val) => onCategoryChange(val)}
              >
                <DropdownMenuRadioItem value="all">
                  All Categories
                </DropdownMenuRadioItem>
                {SEED_DATA.categories.map((cat) => (
                  <DropdownMenuRadioItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Stock Status Dropdown Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-normal rounded-lg border-border/70 bg-card/70 hover:bg-card hover:border-border text-foreground shadow-2xs transition-all",
                  filters.stockStatus !== "all" &&
                    "border-primary/30 bg-primary/10 text-primary font-medium hover:bg-primary/15"
                )}
                aria-label="Filter products by stock status"
              >
                <Boxes className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>
                  Stock:{" "}
                  <strong className="font-semibold text-foreground">
                    {filters.stockStatus === "all" ? "All" : filters.stockStatus}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>Stock Availability</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.stockStatus}
                onValueChange={(val) => onStockChange(val as StockStatus | "all")}
              >
                {STOCK_STATUS_OPTIONS.map((status) => (
                  <DropdownMenuRadioItem key={status} value={status}>
                    {status === "all" ? "All Stock" : status}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Performance Dropdown Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-3 text-xs font-normal rounded-lg border-border/70 bg-card/70 hover:bg-card hover:border-border text-foreground shadow-2xs transition-all",
                  filters.performance !== "all" &&
                    "border-primary/30 bg-primary/10 text-primary font-medium hover:bg-primary/15"
                )}
                aria-label="Filter products by performance"
              >
                <Sparkles className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                <span>
                  Tier:{" "}
                  <strong className="font-semibold text-foreground">
                    {filters.performance === "all" ? "All" : filters.performance}
                  </strong>
                </span>
                <ChevronDown className="h-3 w-3 text-slate-600 dark:text-slate-400 ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel>Performance Tier</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={filters.performance}
                onValueChange={(val) =>
                  onPerformanceChange(val as ProductPerformance | "all")
                }
              >
                {PERFORMANCE_OPTIONS.map((perf) => (
                  <DropdownMenuRadioItem key={perf} value={perf}>
                    {perf === "all" ? "All Tiers" : perf}
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
              aria-label="Clear all product filters"
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
      </div>
    </div>
  );
}
