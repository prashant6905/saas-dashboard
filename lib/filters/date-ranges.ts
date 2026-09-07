import type { DatePresetKey, FilterPresetRange } from "./types";

export const DATASET_ANCHOR_DATE = new Date("2026-09-01T23:59:59.000Z");

/**
 * Computes exact start, end, and labels for all date presets relative to the anchor horizon.
 */
export function getFilterDateRange(
  preset: DatePresetKey,
  customStart?: string,
  customEnd?: string
): FilterPresetRange {
  const anchorEnd = new Date(DATASET_ANCHOR_DATE);
  const start = new Date(DATASET_ANCHOR_DATE);

  switch (preset) {
    case "today": {
      const todayStart = new Date(DATASET_ANCHOR_DATE);
      todayStart.setUTCHours(0, 0, 0, 0);
      return {
        preset: "today",
        startDate: todayStart.toISOString(),
        endDate: anchorEnd.toISOString(),
        label: "Today",
        comparisonLabel: "vs yesterday",
      };
    }

    case "7d": {
      start.setUTCDate(anchorEnd.getUTCDate() - 7);
      return {
        preset: "7d",
        startDate: start.toISOString(),
        endDate: anchorEnd.toISOString(),
        label: "Last 7 Days",
        comparisonLabel: "vs prior 7 days",
      };
    }

    case "30d": {
      start.setUTCDate(anchorEnd.getUTCDate() - 30);
      return {
        preset: "30d",
        startDate: start.toISOString(),
        endDate: anchorEnd.toISOString(),
        label: "Last 30 Days",
        comparisonLabel: "vs prior 30 days",
      };
    }

    case "90d": {
      start.setUTCDate(anchorEnd.getUTCDate() - 90);
      return {
        preset: "90d",
        startDate: start.toISOString(),
        endDate: anchorEnd.toISOString(),
        label: "Last 90 Days",
        comparisonLabel: "vs prior 90 days",
      };
    }

    case "12m": {
      start.setUTCFullYear(anchorEnd.getUTCFullYear() - 1);
      return {
        preset: "12m",
        startDate: start.toISOString(),
        endDate: anchorEnd.toISOString(),
        label: "Last 12 Months",
        comparisonLabel: "vs prior year",
      };
    }

    case "custom": {
      let resolvedStart = customStart ? new Date(customStart) : null;
      let resolvedEnd = customEnd ? new Date(customEnd) : null;

      // Validate date parsing
      if (!resolvedStart || isNaN(resolvedStart.getTime())) {
        resolvedStart = new Date(DATASET_ANCHOR_DATE);
        resolvedStart.setUTCDate(anchorEnd.getUTCDate() - 30);
      }
      if (!resolvedEnd || isNaN(resolvedEnd.getTime())) {
        resolvedEnd = new Date(DATASET_ANCHOR_DATE);
      }

      // If start is after end, normalize
      if (resolvedStart.getTime() > resolvedEnd.getTime()) {
        const temp = resolvedStart;
        resolvedStart = resolvedEnd;
        resolvedEnd = temp;
      }

      // Ensure start is at beginning of day if provided as YYYY-MM-DD
      if (customStart && customStart.length === 10) {
        resolvedStart.setUTCHours(0, 0, 0, 0);
      }
      if (customEnd && customEnd.length === 10) {
        resolvedEnd.setUTCHours(23, 59, 59, 999);
      }

      return {
        preset: "custom",
        startDate: resolvedStart.toISOString(),
        endDate: resolvedEnd.toISOString(),
        label: "Custom Range",
        comparisonLabel: "vs prior period",
      };
    }
  }
}

/**
 * Formats ISO date into human-readable shorthand (e.g. "Aug 2, 2026").
 */
export function formatRangeDateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
