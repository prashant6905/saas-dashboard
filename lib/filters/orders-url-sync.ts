"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { OrderStatus, Region } from "@/types/ecommerce";
import type { DatePresetKey } from "@/lib/filters/types";
import {
  DEFAULT_ORDERS_FILTERS,
  type OrdersTableFilters,
} from "@/types/orders-table";

const VALID_STATUSES: OrderStatus[] = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

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

const VALID_PRESETS = new Set<string>([
  "all",
  "today",
  "7d",
  "30d",
  "90d",
  "12m",
]);

const VALID_SORT_FIELDS = new Set<OrdersTableFilters["sortBy"]>([
  "createdAt",
  "totalAmount",
  "customerName",
  "status",
]);

/**
 * Parses URL search parameters safely into an OrdersTableFilters model.
 */
export function parseOrdersUrlParams(
  searchParams: URLSearchParams | { get: (name: string) => string | null }
): OrdersTableFilters {
  // 1. Search
  const search = searchParams.get("search")?.trim() || "";

  // 2. Status
  const statusParam = searchParams.get("status")?.toLowerCase();
  let status: OrderStatus | "all" = "all";
  if (statusParam && statusParam !== "all") {
    const match = VALID_STATUSES.find((s) => s.toLowerCase() === statusParam);
    if (match) status = match;
  }

  // 3. Region
  const regionParam = searchParams.get("region")?.toLowerCase().replace(/[-_]/g, " ");
  let region: Region | "all" = "all";
  if (regionParam && regionParam !== "all") {
    const match = VALID_REGIONS.find((r) => r.toLowerCase() === regionParam);
    if (match) region = match;
  }

  // 4. Category
  const categoryParam = searchParams.get("category")?.trim();
  const category = categoryParam && categoryParam !== "all" ? categoryParam : "all";

  // 5. Date Range Preset
  const rangeParam = searchParams.get("range")?.toLowerCase();
  let range: DatePresetKey | "all" = "all";
  if (rangeParam && VALID_PRESETS.has(rangeParam)) {
    range = rangeParam as DatePresetKey | "all";
  }

  // 6. Pagination: Page & PageSize
  const pageRaw = parseInt(searchParams.get("page") || "1", 10);
  const page = !isNaN(pageRaw) && pageRaw >= 1 ? pageRaw : 1;

  const pageSizeRaw = parseInt(searchParams.get("pageSize") || "20", 10);
  const pageSize = [10, 20, 50, 100].includes(pageSizeRaw) ? pageSizeRaw : 20;

  // 7. Sorting
  const sortParam = searchParams.get("sort") as OrdersTableFilters["sortBy"];
  const sortBy: OrdersTableFilters["sortBy"] =
    sortParam && VALID_SORT_FIELDS.has(sortParam) ? sortParam : "createdAt";

  const orderParam = searchParams.get("order")?.toLowerCase();
  const sortOrder: "asc" | "desc" = orderParam === "asc" ? "asc" : "desc";

  return {
    search,
    status,
    region,
    category,
    range,
    page,
    pageSize,
    sortBy,
    sortOrder,
  };
}

/**
 * Serializes OrdersTableFilters to URLSearchParams, omitting default values.
 */
export function ordersFiltersToSearchParams(
  filters: OrdersTableFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status !== "all") {
    params.set("status", filters.status.toLowerCase());
  }

  if (filters.region !== "all") {
    params.set("region", filters.region.toLowerCase().replace(/\s+/g, "-"));
  }

  if (filters.category && filters.category !== "all") {
    params.set("category", filters.category);
  }

  if (filters.range !== "all") {
    params.set("range", filters.range);
  }

  if (filters.page > 1) {
    params.set("page", filters.page.toString());
  }

  if (filters.pageSize !== DEFAULT_ORDERS_FILTERS.pageSize) {
    params.set("pageSize", filters.pageSize.toString());
  }

  if (
    filters.sortBy !== DEFAULT_ORDERS_FILTERS.sortBy ||
    filters.sortOrder !== DEFAULT_ORDERS_FILTERS.sortOrder
  ) {
    params.set("sort", filters.sortBy);
    params.set("order", filters.sortOrder);
  }

  return params;
}

export function areOrdersFiltersDefault(filters: OrdersTableFilters): boolean {
  return (
    !filters.search &&
    filters.status === "all" &&
    filters.region === "all" &&
    filters.category === "all" &&
    filters.range === "all" &&
    filters.page === 1 &&
    filters.pageSize === DEFAULT_ORDERS_FILTERS.pageSize &&
    filters.sortBy === DEFAULT_ORDERS_FILTERS.sortBy &&
    filters.sortOrder === DEFAULT_ORDERS_FILTERS.sortOrder
  );
}

export function getOrdersActiveFilterCount(filters: OrdersTableFilters): number {
  let count = 0;
  if (filters.search) count++;
  if (filters.status !== "all") count++;
  if (filters.region !== "all") count++;
  if (filters.category && filters.category !== "all") count++;
  if (filters.range !== "all") count++;
  return count;
}

/**
 * Custom React hook synchronizing OrdersTableFilters with URL parameters.
 */
export function useOrdersTableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive filters cleanly from URL
  const filters = React.useMemo(() => {
    return parseOrdersUrlParams(searchParams);
  }, [searchParams]);

  const updateFilters = React.useCallback(
    (updater: (prev: OrdersTableFilters) => OrdersTableFilters) => {
      const next = updater(filters);
      const params = ordersFiltersToSearchParams(next);
      const query = params.toString();
      const targetUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [filters, pathname, router]
  );

  const setSearch = React.useCallback(
    (search: string) => {
      updateFilters((prev) => ({ ...prev, search, page: 1 }));
    },
    [updateFilters]
  );

  const setStatus = React.useCallback(
    (status: OrderStatus | "all") => {
      updateFilters((prev) => ({ ...prev, status, page: 1 }));
    },
    [updateFilters]
  );

  const setRegion = React.useCallback(
    (region: Region | "all") => {
      updateFilters((prev) => ({ ...prev, region, page: 1 }));
    },
    [updateFilters]
  );

  const setCategory = React.useCallback(
    (category: string | "all") => {
      updateFilters((prev) => ({ ...prev, category, page: 1 }));
    },
    [updateFilters]
  );

  const setRange = React.useCallback(
    (range: DatePresetKey | "all") => {
      updateFilters((prev) => ({ ...prev, range, page: 1 }));
    },
    [updateFilters]
  );

  const setSorting = React.useCallback(
    (sortBy: OrdersTableFilters["sortBy"], sortOrder: "asc" | "desc") => {
      updateFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    },
    [updateFilters]
  );

  const setPagination = React.useCallback(
    (page: number, pageSize?: number) => {
      updateFilters((prev) => ({
        ...prev,
        page,
        pageSize: pageSize ?? prev.pageSize,
      }));
    },
    [updateFilters]
  );

  const clearFilters = React.useCallback(() => {
    updateFilters(() => DEFAULT_ORDERS_FILTERS);
  }, [updateFilters]);

  const activeFilterCount = React.useMemo(
    () => getOrdersActiveFilterCount(filters),
    [filters]
  );
  const isDefault = React.useMemo(() => areOrdersFiltersDefault(filters), [filters]);

  return {
    filters,
    setSearch,
    setStatus,
    setRegion,
    setCategory,
    setRange,
    setSorting,
    setPagination,
    clearFilters,
    activeFilterCount,
    isDefault,
  };
}
