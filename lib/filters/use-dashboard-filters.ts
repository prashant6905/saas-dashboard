"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CustomerSegment, OrderStatus, Region } from "@/types/ecommerce";
import {
  DEFAULT_DASHBOARD_FILTERS,
  type DashboardFilters,
  type DatePresetKey,
} from "./types";
import {
  areFiltersDefault,
  filtersToSearchParams,
  getActiveFilterCount,
  parseUrlFilters,
} from "./url-sync";

export interface UseDashboardFiltersReturn {
  filters: DashboardFilters;
  setDateRange: (
    preset: DatePresetKey,
    customStart?: string,
    customEnd?: string
  ) => void;
  setRegion: (region: Region | "all") => void;
  setCategory: (category: string | "all") => void;
  setStatus: (status: OrderStatus | "all") => void;
  setSegment: (segment: CustomerSegment | "all") => void;
  clearFilters: () => void;
  removeFilter: (key: keyof DashboardFilters) => void;
  activeCount: number;
  isDefault: boolean;
}

export function useDashboardFilters(): UseDashboardFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Derive filters directly from URL search parameters without redundant state
  const filters = React.useMemo(() => {
    return parseUrlFilters(searchParams);
  }, [searchParams]);

  // Synchronize filter updates with browser URL
  const updateFilters = React.useCallback(
    (updater: (prev: DashboardFilters) => DashboardFilters) => {
      const next = updater(filters);
      const params = filtersToSearchParams(next);
      const query = params.toString();
      const targetUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [filters, pathname, router]
  );

  const setDateRange = React.useCallback(
    (preset: DatePresetKey, customStart?: string, customEnd?: string) => {
      updateFilters((prev) => ({
        ...prev,
        range: preset,
        customStart: preset === "custom" ? customStart ?? prev.customStart : undefined,
        customEnd: preset === "custom" ? customEnd ?? prev.customEnd : undefined,
      }));
    },
    [updateFilters]
  );

  const setRegion = React.useCallback(
    (region: Region | "all") => {
      updateFilters((prev) => ({ ...prev, region }));
    },
    [updateFilters]
  );

  const setCategory = React.useCallback(
    (category: string | "all") => {
      updateFilters((prev) => ({ ...prev, category }));
    },
    [updateFilters]
  );

  const setStatus = React.useCallback(
    (status: OrderStatus | "all") => {
      updateFilters((prev) => ({ ...prev, status }));
    },
    [updateFilters]
  );

  const setSegment = React.useCallback(
    (segment: CustomerSegment | "all") => {
      updateFilters((prev) => ({ ...prev, segment }));
    },
    [updateFilters]
  );

  const clearFilters = React.useCallback(() => {
    updateFilters(() => DEFAULT_DASHBOARD_FILTERS);
  }, [updateFilters]);

  const removeFilter = React.useCallback(
    (key: keyof DashboardFilters) => {
      updateFilters((prev) => {
        if (key === "range") {
          return {
            ...prev,
            range: DEFAULT_DASHBOARD_FILTERS.range,
            customStart: undefined,
            customEnd: undefined,
          };
        }
        return {
          ...prev,
          [key]: "all",
        };
      });
    },
    [updateFilters]
  );

  const activeCount = React.useMemo(() => getActiveFilterCount(filters), [filters]);
  const isDefault = React.useMemo(() => areFiltersDefault(filters), [filters]);

  return {
    filters,
    setDateRange,
    setRegion,
    setCategory,
    setStatus,
    setSegment,
    clearFilters,
    removeFilter,
    activeCount,
    isDefault,
  };
}
