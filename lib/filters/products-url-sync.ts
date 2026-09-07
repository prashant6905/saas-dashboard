"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  ProductPerformance,
  ProductsTableFilters,
  StockStatus,
} from "@/types/products-table";

export const DEFAULT_PRODUCTS_FILTERS: ProductsTableFilters = {
  search: "",
  category: "all",
  stockStatus: "all",
  performance: "all",
  sortBy: "revenue",
  sortOrder: "desc",
  page: 1,
  pageSize: 20,
};

const VALID_SORT_COLUMNS = [
  "name",
  "price",
  "unitsSold",
  "revenue",
  "grossProfit",
  "stock",
] as const;

const VALID_STOCK_STATUSES: StockStatus[] = [
  "In Stock",
  "Low Stock",
  "Out of Stock",
];

const VALID_PERFORMANCES: ProductPerformance[] = [
  "Top Performer",
  "Strong",
  "Average",
  "Underperforming",
];

export function parseProductsUrlParams(
  searchParams: URLSearchParams
): ProductsTableFilters {
  const search = searchParams.get("search")?.trim() || "";
  const rawCategory = searchParams.get("category")?.trim();
  const category = rawCategory && rawCategory !== "" ? rawCategory : "all";

  const rawStock = searchParams.get("stock")?.trim();
  const stockStatus: StockStatus | "all" =
    rawStock && VALID_STOCK_STATUSES.includes(rawStock as StockStatus)
      ? (rawStock as StockStatus)
      : "all";

  const rawPerf = searchParams.get("perf")?.trim();
  const performance: ProductPerformance | "all" =
    rawPerf && VALID_PERFORMANCES.includes(rawPerf as ProductPerformance)
      ? (rawPerf as ProductPerformance)
      : "all";

  const rawSort = searchParams.get("sort");
  const sortBy =
    rawSort &&
    VALID_SORT_COLUMNS.includes(rawSort as ProductsTableFilters["sortBy"])
      ? (rawSort as ProductsTableFilters["sortBy"])
      : "revenue";

  const rawOrder = searchParams.get("order");
  const sortOrder: "asc" | "desc" = rawOrder === "asc" ? "asc" : "desc";

  const rawPage = parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawPageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const pageSize = [10, 20, 50].includes(rawPageSize) ? rawPageSize : 20;

  return {
    search,
    category,
    stockStatus,
    performance,
    sortBy,
    sortOrder,
    page,
    pageSize,
  };
}

export function productsFiltersToSearchParams(
  filters: ProductsTableFilters
): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }
  if (filters.category !== "all") {
    params.set("category", filters.category);
  }
  if (filters.stockStatus !== "all") {
    params.set("stock", filters.stockStatus);
  }
  if (filters.performance !== "all") {
    params.set("perf", filters.performance);
  }
  if (filters.page > 1) {
    params.set("page", filters.page.toString());
  }
  if (filters.pageSize !== 20) {
    params.set("pageSize", filters.pageSize.toString());
  }
  if (filters.sortBy !== "revenue" || filters.sortOrder !== "desc") {
    params.set("sort", filters.sortBy);
    params.set("order", filters.sortOrder);
  }

  return params;
}

export function getProductsActiveFilterCount(
  filters: ProductsTableFilters
): number {
  let count = 0;
  if (filters.search) count++;
  if (filters.category !== "all") count++;
  if (filters.stockStatus !== "all") count++;
  if (filters.performance !== "all") count++;
  return count;
}

export function useProductsTableFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = React.useMemo(() => {
    return parseProductsUrlParams(searchParams);
  }, [searchParams]);

  const updateFilters = React.useCallback(
    (newFilters: ProductsTableFilters) => {
      const params = productsFiltersToSearchParams(newFilters);
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

  const setCategory = React.useCallback(
    (category: string | "all") => {
      updateFilters({ ...filters, category, page: 1 });
    },
    [filters, updateFilters]
  );

  const setStockStatus = React.useCallback(
    (stockStatus: StockStatus | "all") => {
      updateFilters({ ...filters, stockStatus, page: 1 });
    },
    [filters, updateFilters]
  );

  const setPerformance = React.useCallback(
    (performance: ProductPerformance | "all") => {
      updateFilters({ ...filters, performance, page: 1 });
    },
    [filters, updateFilters]
  );

  const setSorting = React.useCallback(
    (sortBy: ProductsTableFilters["sortBy"], sortOrder: "asc" | "desc") => {
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
      ...DEFAULT_PRODUCTS_FILTERS,
      pageSize: filters.pageSize,
    });
  }, [filters.pageSize, updateFilters]);

  const activeFilterCount = React.useMemo(() => {
    return getProductsActiveFilterCount(filters);
  }, [filters]);

  return {
    filters,
    setSearch,
    setCategory,
    setStockStatus,
    setPerformance,
    setSorting,
    setPagination,
    clearFilters,
    activeFilterCount,
  };
}
