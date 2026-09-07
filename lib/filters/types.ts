import type { CustomerSegment, OrderStatus, Region } from "@/types/ecommerce";

export type DatePresetKey = "today" | "7d" | "30d" | "90d" | "12m" | "custom";

export interface DashboardFilters {
  range: DatePresetKey;
  customStart?: string; // YYYY-MM-DD or ISO string
  customEnd?: string;   // YYYY-MM-DD or ISO string
  region: Region | "all";
  category: string | "all"; // Category ID or "all"
  status: OrderStatus | "all";
  segment: CustomerSegment | "all";
}

export interface FilterPresetRange {
  preset: DatePresetKey;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  label: string;
  comparisonLabel: string;
}

export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFilters = {
  range: "30d",
  region: "all",
  category: "all",
  status: "all",
  segment: "all",
};
