"use client";

import * as React from "react";
import {
  AlertCircle,
  FolderArchive,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { ExportButton } from "@/components/export/export-button";
import { SEED_DATA } from "@/lib/data/seed-data";
import {
  comparePeriods,
  filterDataset,
  getRevenueByCategory,
  getRevenueByDay,
  getRevenueByMonth,
  getRevenueByRegion,
  getTopProducts,
} from "@/lib/analytics";
import {
  getFilterDateRange,
  toAnalyticsFilter,
  useDashboardFilters,
} from "@/lib/filters";
import { DashboardFilterToolbar } from "@/components/dashboard/dashboard-filter-toolbar";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart";
import { CategorySalesChart } from "@/components/dashboard/category-sales-chart";
import { RegionalPerformance } from "@/components/dashboard/regional-performance";
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table";
import { TopProductsList } from "@/components/dashboard/top-products-list";
import { RecentCustomersCard } from "@/components/dashboard/recent-customers-card";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

function DashboardContent() {
  const {
    filters,
    setDateRange,
    setRegion,
    setCategory,
    setStatus,
    setSegment,
    clearFilters,
    removeFilter,
    activeCount,
  } = useDashboardFilters();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Pre-index customers for fast order lookup
  const customerMap = React.useMemo(() => {
    return new Map(SEED_DATA.customers.map((c) => [c.id, c]));
  }, []);

  // Compute active date horizon metadata
  const range = React.useMemo(() => {
    return getFilterDateRange(
      filters.range,
      filters.customStart,
      filters.customEnd
    );
  }, [filters.range, filters.customStart, filters.customEnd]);

  // Convert centralized filters into domain AnalyticsFilter
  const analyticsFilter = React.useMemo(() => {
    return toAnalyticsFilter(filters);
  }, [filters]);

  // Refresh handler with brief animated feedback
  const handleRefresh = React.useCallback(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  // Compute analytics dynamically from active filters
  const { data: analyticsData, error: calculationError } = React.useMemo(() => {
    try {
      const comparison = comparePeriods(SEED_DATA, analyticsFilter);
      const timeSeries =
        filters.range === "12m"
          ? getRevenueByMonth(SEED_DATA, analyticsFilter)
          : getRevenueByDay(SEED_DATA, analyticsFilter);
      const categories = getRevenueByCategory(SEED_DATA, analyticsFilter);
      const regions = getRevenueByRegion(SEED_DATA, analyticsFilter);
      const topProducts = getTopProducts(SEED_DATA, analyticsFilter, 5);
      const filtered = filterDataset(SEED_DATA, analyticsFilter);
      const sortedOrders = [...filtered.orders].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        data: {
          comparison,
          timeSeries,
          categories,
          regions,
          topProducts,
          orders: sortedOrders,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Computation failed",
      };
    }
  }, [analyticsFilter, filters.range]);

  const hasError = Boolean(calculationError);

  return (
    <div className="space-y-8">
      {/* 1. Clean Professional Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-md bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Command Center • Live Overview</span>
          </div>
          <h1 className="text-[32px] sm:text-[34px] font-semibold tracking-[-0.025em] leading-tight text-foreground font-heading">
            Dashboard
          </h1>
          <p className="text-xs sm:text-[13px] text-muted-foreground leading-relaxed tracking-[-0.01em]">
            Real-time commerce telemetry, order velocity, and customer insights across Indian markets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <ExportButton
            type="analytics"
            options={{
              range: filters.range,
              region: filters.region,
              category: filters.category,
              status: filters.status,
            }}
            label="Export Analytics"
          />
        </div>
      </div>

      {/* 2. Centralized Global Filter Toolbar */}
      <DashboardFilterToolbar
        filters={filters}
        onSetDateRange={setDateRange}
        onSetRegion={setRegion}
        onSetCategory={setCategory}
        onSetStatus={setStatus}
        onSetSegment={setSegment}
        onClearFilters={clearFilters}
        onRemoveFilter={removeFilter}
        onRefresh={handleRefresh}
        isRefreshing={isLoading}
        activeCount={activeCount}
      />

      {/* 3. States: Error, Loading, Empty, or Complete Content */}
      {hasError ? (
        /* Error State */
        <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
          <CardContent className="flex flex-col items-center justify-center space-y-3 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Analytics Computation Failed
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                An unexpected calculation error occurred while filtering data:{" "}
                {calculationError}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Calculation</span>
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        /* Loading State */
        <DashboardSkeleton />
      ) : !analyticsData || analyticsData.orders.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center border-dashed">
          <CardContent className="flex flex-col items-center justify-center space-y-3 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FolderArchive className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                No Transaction Data Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                No orders matched the selected filter criteria ({range.label}
                {filters.region !== "all" ? `, ${filters.region}` : ""}
                {filters.status !== "all" ? `, ${filters.status}` : ""}).
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-xs"
            >
              Reset All Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Render Populated Dashboard Modules */
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Reusable KPI Cards Grid */}
          <KpiGrid
            comparison={analyticsData.comparison}
            comparisonLabel={range.comparisonLabel}
          />

          {/* 12-Column Responsive Layout: Main Area (8 cols) & Supporting Area (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Primary Main Content: 8 Columns */}
            <div className="lg:col-span-8 space-y-6">
              {/* Revenue Velocity Trend Chart */}
              <RevenueTrendChart
                data={analyticsData.timeSeries}
                periodLabel={range.label}
              />

              {/* Category Sales Distribution */}
              <CategorySalesChart
                data={analyticsData.categories}
              />

              {/* Recent Orders Ledger Table */}
              <RecentOrdersTable
                orders={analyticsData.orders}
                customerMap={customerMap}
              />
            </div>

            {/* Supporting Right Column: 4 Columns */}
            <div className="lg:col-span-4 space-y-6">
              {/* Popular Products List */}
              <TopProductsList products={analyticsData.topProducts} />

              {/* Recent Customers List */}
              <RecentCustomersCard />

              {/* Regional State Performance */}
              <RegionalPerformance data={analyticsData.regions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </React.Suspense>
  );
}
