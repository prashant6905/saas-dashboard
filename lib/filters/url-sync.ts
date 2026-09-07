import type { CustomerSegment, OrderStatus, Region } from "@/types/ecommerce";
import type { AnalyticsFilter } from "@/lib/analytics/types";
import { SEED_DATA } from "@/lib/data/seed-data";
import { getFilterDateRange } from "./date-ranges";
import {
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardFilters,
  type DatePresetKey,
} from "./types";

const VALID_PRESETS = new Set<DatePresetKey>([
  "today",
  "7d",
  "30d",
  "90d",
  "12m",
  "custom",
]);

const VALID_REGIONS: Region[] = [
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

const VALID_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const VALID_SEGMENTS: CustomerSegment[] = [
  "New",
  "Returning",
  "VIP",
  "At Risk",
];

/**
 * Normalizes and resolves a region string case-insensitively.
 */
function resolveRegion(value?: string | null): Region | "all" {
  if (!value || value.toLowerCase() === "all") return "all";
  const normalized = value.toLowerCase().replace(/[-_]/g, " ");
  const match = VALID_REGIONS.find((r) => r.toLowerCase() === normalized);
  return match ?? "all";
}

/**
 * Normalizes and resolves a category string by ID or case-insensitive name/slug.
 */
function resolveCategory(value?: string | null): string | "all" {
  if (!value || value.toLowerCase() === "all") return "all";
  const normalized = value.toLowerCase().replace(/[-_]/g, " ").trim();

  // Direct match by ID
  const byId = SEED_DATA.categories.find((c) => c.id.toLowerCase() === normalized);
  if (byId) return byId.id;

  // Match by Name or slugified name
  const byName = SEED_DATA.categories.find(
    (c) =>
      c.name.toLowerCase() === normalized ||
      c.name.toLowerCase().replace(/[&]/g, "and").replace(/[^a-z0-9]+/g, " ").trim() ===
        normalized
  );
  if (byName) return byName.id;

  // Substring match (e.g. "electronics" matches "Consumer Electronics")
  const bySubstring = SEED_DATA.categories.find(
    (c) =>
      c.name.toLowerCase().includes(normalized) ||
      normalized.includes(c.name.toLowerCase())
  );
  if (bySubstring) return bySubstring.id;

  return "all";
}

/**
 * Normalizes and resolves an order status string case-insensitively.
 */
function resolveStatus(value?: string | null): OrderStatus | "all" {
  if (!value || value.toLowerCase() === "all") return "all";
  const normalized = value.toLowerCase();
  const match = VALID_STATUSES.find((s) => s.toLowerCase() === normalized);
  return match ?? "all";
}

/**
 * Normalizes and resolves a customer segment string case-insensitively.
 */
function resolveSegment(value?: string | null): CustomerSegment | "all" {
  if (!value || value.toLowerCase() === "all") return "all";
  const normalized = value.toLowerCase().replace(/[-_]/g, " ");
  const match = VALID_SEGMENTS.find((s) => s.toLowerCase() === normalized);
  return match ?? "all";
}

/**
 * Parses URL query parameters safely into a validated DashboardFilters model.
 * Guarantees zero crashes on unexpected or corrupted values.
 */
export function parseUrlFilters(
  searchParams: URLSearchParams | { get: (name: string) => string | null }
): DashboardFilters {
  const rangeParam = searchParams.get("range")?.toLowerCase();
  const range: DatePresetKey =
    rangeParam && VALID_PRESETS.has(rangeParam as DatePresetKey)
      ? (rangeParam as DatePresetKey)
      : DEFAULT_DASHBOARD_FILTERS.range;

  const customStart = searchParams.get("from") || undefined;
  const customEnd = searchParams.get("to") || undefined;

  const region = resolveRegion(searchParams.get("region"));
  const category = resolveCategory(searchParams.get("category"));
  const status = resolveStatus(searchParams.get("status"));
  const segment = resolveSegment(searchParams.get("segment"));

  return {
    range,
    customStart: range === "custom" ? customStart : undefined,
    customEnd: range === "custom" ? customEnd : undefined,
    region,
    category,
    status,
    segment,
  };
}

/**
 * Serializes DashboardFilters to URLSearchParams, omitting default values.
 */
export function filtersToSearchParams(filters: DashboardFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.range !== DEFAULT_DASHBOARD_FILTERS.range) {
    params.set("range", filters.range);
    if (filters.range === "custom") {
      if (filters.customStart) params.set("from", filters.customStart.substring(0, 10));
      if (filters.customEnd) params.set("to", filters.customEnd.substring(0, 10));
    }
  }

  if (filters.region !== "all") {
    params.set("region", filters.region.toLowerCase().replace(/\s+/g, "-"));
  }

  if (filters.category !== "all") {
    // Find category name for clean URL representation
    const cat = SEED_DATA.categories.find((c) => c.id === filters.category);
    if (cat) {
      params.set(
        "category",
        cat.name.toLowerCase().replace(/[&]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-")
      );
    } else {
      params.set("category", filters.category);
    }
  }

  if (filters.status !== "all") {
    params.set("status", filters.status.toLowerCase());
  }

  if (filters.segment !== "all") {
    params.set("segment", filters.segment.toLowerCase().replace(/\s+/g, "-"));
  }

  return params;
}

/**
 * Checks if the given filters equal default filters.
 */
export function areFiltersDefault(filters: DashboardFilters): boolean {
  return (
    filters.range === DEFAULT_DASHBOARD_FILTERS.range &&
    filters.region === "all" &&
    filters.category === "all" &&
    filters.status === "all" &&
    filters.segment === "all"
  );
}

/**
 * Counts how many non-default filters are currently applied.
 */
export function getActiveFilterCount(filters: DashboardFilters): number {
  let count = 0;
  if (filters.range !== DEFAULT_DASHBOARD_FILTERS.range) count++;
  if (filters.region !== "all") count++;
  if (filters.category !== "all") count++;
  if (filters.status !== "all") count++;
  if (filters.segment !== "all") count++;
  return count;
}

/**
 * Transforms DashboardFilters into an AnalyticsFilter for @/lib/analytics.
 */
export function toAnalyticsFilter(filters: DashboardFilters): AnalyticsFilter {
  const range = getFilterDateRange(
    filters.range,
    filters.customStart,
    filters.customEnd
  );

  return {
    dateRange: {
      startDate: range.startDate,
      endDate: range.endDate,
    },
    regions: filters.region !== "all" ? [filters.region] : undefined,
    categories: filters.category !== "all" ? [filters.category] : undefined,
    statuses: filters.status !== "all" ? [filters.status] : undefined,
    segments: filters.segment !== "all" ? [filters.segment] : undefined,
  };
}
