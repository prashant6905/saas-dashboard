import type { CustomerSegment, OrderStatus, Region } from "@/types/ecommerce";
import { formatINR, formatIndianNumber } from "@/lib/utils";

/**
 * Standardized, accessible color tokens tailored for dark & light mode harmony.
 */
export const CHART_COLORS = {
  revenue: "#6366f1", // Indigo
  profit: "#8b5cf6",  // Violet
  margin: "#f59e0b",  // Amber
  orders: "#0ea5e9",  // Sky
  units: "#a855f7",   // Purple
  cogs: "#f43f5e",    // Rose
  grid: "hsl(var(--border) / 0.4)",
  axisText: "hsl(var(--muted-foreground))",
  
  // Categorical sequence for multi-bar / pie breakdowns
  palette: [
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#0ea5e9", // Sky
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#3b82f6", // Blue
    "#84cc16", // Lime
  ],

  // Order status semantic palette
  status: {
    Delivered: "#10b981",
    Shipped: "#0ea5e9",
    Processing: "#6366f1",
    Pending: "#f59e0b",
    Cancelled: "#ef4444",
  } as Record<OrderStatus, string>,

  // Customer segment semantic palette
  segment: {
    VIP: "#8b5cf6",
    Returning: "#10b981",
    New: "#0ea5e9",
    "At Risk": "#f59e0b",
  } as Record<CustomerSegment, string>,

  // Regional palette (Top Indian States)
  region: {
    Maharashtra: "#6366f1",
    Karnataka: "#06b6d4",
    Delhi: "#10b981",
    "Tamil Nadu": "#f59e0b",
    Telangana: "#8b5cf6",
    Gujarat: "#ec4899",
    "Uttar Pradesh": "#14b8a6",
    "West Bengal": "#f97316",
    Rajasthan: "#3b82f6",
    Kerala: "#84cc16",
  } as Record<Region, string>,
};

/**
 * Shared chart cursor configuration to prevent default light/white SVG rectangles in dark mode.
 */
export const CHART_CURSOR = {
  // Disables the opaque default #ccc rectangle on BarCharts
  bar: false as const,
  // Subtle, theme-aware dashed line for Area/Line charts
  line: {
    stroke: "hsl(var(--border) / 0.7)",
    strokeWidth: 1,
    strokeDasharray: "3 3",
  },
};

/**
 * Subtle active bar highlight configuration (brightens hovered bar without background rectangle)
 */
export const ACTIVE_BAR_CONFIG = {
  stroke: "rgba(255, 255, 255, 0.35)",
  strokeWidth: 1,
  filter: "brightness(1.15)",
};

/**
 * Formats monetary amounts in Indian Rupees (₹) with Lakhs (L) and Crores (Cr) support.
 */
export function formatCurrency(
  value: number,
  options?: { compact?: boolean; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  return formatINR(value, options);
}

/**
 * Formats large count values using Indian comma numbering system or compact notation
 */
export function formatNumber(value: number, compact = false): string {
  return formatIndianNumber(value, compact);
}

/**
 * Formats percentage with 1 decimal place
 */
export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

/**
 * Formats X-axis date tick (YYYY-MM or YYYY-MM-DD)
 */
export function formatDateTick(tickItem: string): string {
  if (tickItem.length === 7) {
    // YYYY-MM -> "Sep 25"
    const [y, m] = tickItem.split("-");
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    const monthName = d.toLocaleDateString("en-IN", { month: "short" });
    const yearShort = y.slice(2);
    return `${monthName} '${yearShort}`;
  }
  if (tickItem.length === 10) {
    // YYYY-MM-DD -> DD/MM (Indian date standard)
    const parts = tickItem.split("-");
    return `${parts[2]}/${parts[1]}`;
  }
  return tickItem;
}
