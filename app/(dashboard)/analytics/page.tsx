"use client";

import * as React from "react";
import {
  AlertCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { ExportButton } from "@/components/export/export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { SEED_DATA } from "@/lib/data/seed-data";
import {
  comparePeriods,
  getCustomerSegmentBreakdown,
  getOrdersByStatus,
  getOverviewMetrics,
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
import { AnalyticsFinancialSummary } from "@/components/analytics/analytics-financial-summary";
import { AnalyticsRevenueTrendChart } from "@/components/analytics/analytics-revenue-trend-chart";
import { AnalyticsCategoryChart } from "@/components/analytics/analytics-category-chart";
import { AnalyticsRegionChart } from "@/components/analytics/analytics-region-chart";
import { AnalyticsOrderStatusChart } from "@/components/analytics/analytics-order-status-chart";
import { AnalyticsCustomerSegmentsChart } from "@/components/analytics/analytics-customer-segments-chart";
import { AnalyticsTopProductsTable } from "@/components/analytics/analytics-top-products-table";
import { AnalyticsSkeleton } from "@/components/analytics/analytics-skeleton";

function AnalyticsContent() {
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
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Compute analytics dynamically from active filters
  const { data: analyticsData, error: calculationError } = React.useMemo(() => {
    try {
      const metrics = getOverviewMetrics(SEED_DATA, analyticsFilter);
      const comparison = comparePeriods(SEED_DATA, analyticsFilter);
      const timeSeries =
        filters.range === "12m"
          ? getRevenueByMonth(SEED_DATA, analyticsFilter)
          : getRevenueByDay(SEED_DATA, analyticsFilter);
      const categories = getRevenueByCategory(SEED_DATA, analyticsFilter);
      const regions = getRevenueByRegion(SEED_DATA, analyticsFilter);
      const orderStatuses = getOrdersByStatus(SEED_DATA, analyticsFilter);
      const topProducts = getTopProducts(SEED_DATA, analyticsFilter, 10);
      const customerSegments = getCustomerSegmentBreakdown(
        SEED_DATA,
        analyticsFilter
      );

      return {
        data: {
          metrics,
          comparison,
          timeSeries,
          categories,
          regions,
          orderStatuses,
          topProducts,
          customerSegments,
        },
        error: null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Failed to calculate analytics",
      };
    }
  }, [filters.range, analyticsFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        title="Analytics"
        description="Multi-dimensional performance analysis across unit economics, merchandise categories, fulfillment, and customer segments."
        badge={
          <Badge
            variant="outline"
            className="text-[10px] font-mono uppercase bg-primary/5 text-primary border-primary/20 gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Deep Dive
          </Badge>
        }
        actions={
          <>
            <div className="hidden sm:flex items-center text-xs font-mono text-muted-foreground bg-muted/40 border border-border/80 px-2.5 py-1 rounded-md">
              {range.label}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 font-normal h-8"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-primary" : "text-muted-foreground"}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <ExportButton
              type="analytics"
              options={{
                range: filters.range,
                region: filters.region,
                category: filters.category,
                status: filters.status,
              }}
              label="Export Report"
              variant="default"
              size="sm"
              className="h-8 font-normal"
            />
          </>
        }
      />

      {/* 2. Centralized Global Filter Bar */}
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

      {/* 3. Error Fallback State */}
      {calculationError && (
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardContent className="flex items-center gap-3 p-4 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Calculation Error: </span>
              {calculationError}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={clearFilters}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 4. Loading State Skeleton */}
      {isLoading && <AnalyticsSkeleton />}

      {/* 5. Main Analytics Dashboard Content */}
      {!isLoading && analyticsData && (
        <div className="space-y-6">
          {/* Section 1: Financial & Unit Economics KPI Bar */}
          <AnalyticsFinancialSummary
            metrics={analyticsData.metrics}
            comparison={analyticsData.comparison}
            comparisonLabel={range.comparisonLabel}
          />

          {/* Section 2: Primary Revenue Velocity Trend & Category Performance */}
          <div className="grid gap-6 lg:grid-cols-12">
            <AnalyticsRevenueTrendChart
              data={analyticsData.timeSeries}
              periodLabel={range.label}
              className="lg:col-span-7"
            />
            <AnalyticsCategoryChart
              data={analyticsData.categories}
              className="lg:col-span-5"
            />
          </div>

          {/* Section 3: Regional Distribution & Order Pipeline Donut */}
          <div className="grid gap-6 lg:grid-cols-2">
            <AnalyticsRegionChart data={analyticsData.regions} />
            <AnalyticsOrderStatusChart data={analyticsData.orderStatuses} />
          </div>

          {/* Section 4: Customer Segments Dynamics & Top Merchandise Matrix */}
          <div className="grid gap-6 lg:grid-cols-12">
            <AnalyticsCustomerSegmentsChart
              data={analyticsData.customerSegments}
              className="lg:col-span-6"
            />
            <AnalyticsTopProductsTable
              products={analyticsData.topProducts}
              totalRevenue={analyticsData.metrics.totalRevenue}
              className="lg:col-span-6"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <React.Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent />
    </React.Suspense>
  );
}
