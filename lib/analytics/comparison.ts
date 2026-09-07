import type { EcommerceDataset } from "@/types/ecommerce";
import { getOverviewMetrics } from "./metrics";
import type {
  AnalyticsFilter,
  MetricComparison,
  OverviewComparison,
  OverviewMetrics,
} from "./types";

/**
 * Calculates percentage change between two numerical values safely.
 *
 * Rules:
 * - If previous === 0 and current === 0: returns 0%
 * - If previous === 0 and current > 0: returns null (undefined baseline / division by zero)
 * - Otherwise: ((current - previous) / Math.abs(previous)) * 100 rounded to 2 decimal places.
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  const change = ((current - previous) / Math.abs(previous)) * 100;
  return Math.round(change * 100) / 100;
}

/**
 * Constructs a MetricComparison object.
 */
export function compareMetricValues(
  current: number,
  previous: number
): MetricComparison {
  const absoluteChange = Math.round((current - previous) * 100) / 100;
  const percentageChange = calculatePercentageChange(current, previous);

  return {
    current: Math.round(current * 100) / 100,
    previous: Math.round(previous * 100) / 100,
    absoluteChange,
    percentageChange,
  };
}

/**
 * Computes the exact preceding equivalent date range.
 * E.g., a 30-day window [T1, T2] yields [T1 - (T2 - T1), T1].
 */
export function getPreviousDateRange(
  startDate: string | Date,
  endDate: string | Date
): { startDate: string; endDate: string } {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (isNaN(start) || isNaN(end) || start >= end) {
    throw new Error("Invalid date range provided to getPreviousDateRange");
  }

  const duration = end - start;
  const prevEnd = new Date(start);
  const prevStart = new Date(start - duration);

  return {
    startDate: prevStart.toISOString(),
    endDate: prevEnd.toISOString(),
  };
}

/**
 * Compares two arbitrary overview metrics records.
 */
export function compareOverviewMetrics(
  currentMetrics: OverviewMetrics,
  previousMetrics: OverviewMetrics
): OverviewComparison {
  return {
    revenue: compareMetricValues(
      currentMetrics.totalRevenue,
      previousMetrics.totalRevenue
    ),
    orders: compareMetricValues(
      currentMetrics.totalOrders,
      previousMetrics.totalOrders
    ),
    customers: compareMetricValues(
      currentMetrics.totalCustomers,
      previousMetrics.totalCustomers
    ),
    averageOrderValue: compareMetricValues(
      currentMetrics.averageOrderValue,
      previousMetrics.averageOrderValue
    ),
    productsSold: compareMetricValues(
      currentMetrics.totalProductsSold,
      previousMetrics.totalProductsSold
    ),
    grossProfit: compareMetricValues(
      currentMetrics.grossProfit,
      previousMetrics.grossProfit
    ),
    grossMargin: compareMetricValues(
      currentMetrics.grossMargin,
      previousMetrics.grossMargin
    ),
  };
}

/**
 * Compares current period performance against previous equivalent period.
 * If previousFilter is omitted, it automatically calculates the preceding equivalent window.
 */
export function comparePeriods(
  data: EcommerceDataset,
  currentFilter: AnalyticsFilter,
  customPreviousFilter?: AnalyticsFilter
): OverviewComparison {
  const currentMetrics = getOverviewMetrics(data, currentFilter);

  let previousFilter = customPreviousFilter;

  if (
    !previousFilter &&
    currentFilter.dateRange?.startDate &&
    currentFilter.dateRange?.endDate
  ) {
    const prevRange = getPreviousDateRange(
      currentFilter.dateRange.startDate,
      currentFilter.dateRange.endDate
    );

    previousFilter = {
      ...currentFilter,
      dateRange: prevRange,
    };
  }

  const previousMetrics = previousFilter
    ? getOverviewMetrics(data, previousFilter)
    : {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        averageOrderValue: 0,
        totalProductsSold: 0,
        grossProfit: 0,
        grossMargin: 0,
        newCustomers: 0,
        returningCustomers: 0,
      };

  return compareOverviewMetrics(currentMetrics, previousMetrics);
}
