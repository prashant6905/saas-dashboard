"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CustomerSegment, Region } from "@/types/ecommerce";
import type { CustomersTableFilters } from "@/types/customers-table";

export const DEFAULT_CUSTOMERS_FILTERS: CustomersTableFilters = {
  search: "",
  region: "all",
  segment: "all",
  sortBy: "totalSpend",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
};

const VALID_SORT_COLUMNS = [
  "name",
  "ordersCount",
  "totalSpend",
  "averageOrderValue",
  "lastPurchaseDate",
] as const;

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

const VALID_SEGMENTS: CustomerSegment[] = [
  "New",
  "Returning",
  "VIP",
  "At Risk",
];

export function parseCustomersUrlParams(
  searchParams: URLSearchParams
): CustomersTableFilters {
  const search = searchParams.get("search")?.trim() || "";

  const rawRegion = searchParams.get("region")?.trim();
  const region: Region | "all" =
    rawRegion && VALID_REGIONS.includes(rawRegion as Region)
      ? (rawRegion as Region)
      : "all";

  const rawSegment = searchParams.get("segment")?.trim();
  const segment: CustomerSegment | "all" =
    rawSegment && VALID_SEGMENTS.includes(rawSegment as CustomerSegment)
      ? (rawSegment as CustomerSegment)
      : "all";

  const rawSort = searchParams.get("sort");
  const sortBy =
    rawSort &&
    VALID_SORT_COLUMNS.includes(rawSort as CustomersTableFilters["sortBy"])
      ? (rawSort as CustomersTableFilters["sortBy"])
      : "totalSpend";

  const rawOrder = searchParams.get("order");
  const sortOrder: "asc" | "desc" = rawOrder === "asc" ? "asc" : "desc";

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawPageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const pageSize = [10, 20, 50].includes(rawPageSize) ? rawPageSize : 20;

  return {
    search,
    region,
    segment,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
}

export function customersFiltersToSearchParams(
  filters: CustomersTableFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.region !== "all") {
    params.set("region", filters.region);
  }
  if (filters.segment !== "all") {
    params.set("segment", filters.segment);
  }
  if (filters.page > 1) {
    params.set("page", filters.page.toString());
  }
  if (filters.pageSize !== 20) {
    params.set("pageSize", filters.pageSize.toString());
  }
  if (filters.sortBy !== "totalSpend" || filters.sortOrder !== "desc") {
    params.set("sort", filters.sortBy);
    params.set("order", filters.sortOrder);
  }

  return params;
}

export function getCustomersActiveFilterCount(
  filters: CustomersTableFilters
): number {
  let count = 0;
  if (filters.search) count++;
  if (filters.region !== "all") count++;
  if (filters.segment !== "all") count++;
  return count;
}

export function useCustomersTableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = React.useMemo(() => {
    return parseCustomersUrlParams(searchParams);
  }, [searchParams]);

  const updateFilters = React.useCallback(
    (newFilters: CustomersTableFilters) => {
      const params = customersFiltersToSearchParams(newFilters);
      const queryStr = params.toString();
      const targetUrl = queryStr ? `${pathname}?${queryStr}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [router, pathname]
  );

  const setSearch = React.useCallback(
    (search: string) => {
      updateFilters({ ...filters, search, page: 1 });
    },
    [filters, updateFilters]
  );

  const setRegion = React.useCallback(
    (region: Region | "all") => {
      updateFilters({ ...filters, region, page: 1 });
    },
    [filters, updateFilters]
  );

  const setSegment = React.useCallback(
    (segment: CustomerSegment | "all") => {
      updateFilters({ ...filters, segment, page: 1 });
    },
    [filters, updateFilters]
  );

  const setSorting = React.useCallback(
    (sortBy: CustomersTableFilters["sortBy"], sortOrder: "asc" | "desc") => {
      updateFilters({ ...filters, sortBy, sortOrder, page: 1 });
    },
    [filters, updateFilters]
  );

  const setPagination = React.useCallback(
    (page: number, pageSize?: number) => {
      updateFilters({
        ...filters,
        page,
        pageSize: pageSize ?? filters.pageSize,
      });
    },
    [filters, updateFilters]
  );

  const clearFilters = React.useCallback(() => {
    updateFilters({
      ...DEFAULT_CUSTOMERS_FILTERS,
      pageSize: filters.pageSize,
    });
  }, [filters.pageSize, updateFilters]);

  const activeFilterCount = React.useMemo(() => {
    return getCustomersActiveFilterCount(filters);
  }, [filters]);

  return {
    filters,
    setSearch,
    setRegion,
    setSegment,
    setSorting,
    setPagination,
    clearFilters,
    activeFilterCount,
  };
}
