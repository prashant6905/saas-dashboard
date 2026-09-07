import { SEED_DATA } from "@/lib/data/seed-data";
import { getProductTableRows } from "@/lib/data/products";
import { getCustomerTableRows } from "@/lib/data/customers";
import { getOrderTableRows, filterOrderTableRows } from "@/lib/data/orders";
import { getFilterDateRange } from "@/lib/filters/date-ranges";
import type { DatePresetKey } from "@/lib/filters/types";
import type { OrderStatus, Region } from "@/types/ecommerce";
import {
  getOverviewMetrics,
  getRevenueByCategory,
  getRevenueByRegion,
  getOrdersByStatus,
} from "@/lib/analytics";
import type { AnalyticsFilter } from "@/lib/analytics/types";
import {
  generateCSV,
  escapeCSVValue,
  ORDERS_CSV_COLUMNS,
  CSVColumn,
} from "./csv-exporter";
import { formatINR } from "@/lib/utils";
import type { ProductTableRow } from "@/types/products-table";
import type { CustomerTableRow } from "@/types/customers-table";

export type ExportType = "orders" | "products" | "customers" | "analytics";

export interface ExportFilterOptions {
  search?: string;
  status?: string;
  region?: string;
  category?: string;
  range?: string;
  page?: number;
  pageSize?: number;
  scope?: "page" | "all";
}

const VALID_DATE_PRESETS = new Set<string>([
  "today",
  "7d",
  "30d",
  "90d",
  "12m",
  "custom",
]);

function isDatePresetKey(key: string): key is DatePresetKey {
  return VALID_DATE_PRESETS.has(key);
}

export function generateCSVContent(
  type: ExportType,
  options?: ExportFilterOptions
): { filename: string; content: string } {
  const timestamp = new Date().toISOString().substring(0, 10);

  switch (type) {
    case "orders": {
      let orders = getOrderTableRows();

      // Apply centralized filtering across search, status, region, category, date range
      if (options) {
        orders = filterOrderTableRows(orders, options);
      }

      // Apply Pagination Scope ("page" vs "all")
      if (options?.scope === "page") {
        const page = Math.max(1, options.page || 1);
        const pageSize = Math.max(1, options.pageSize || 20);
        const startIndex = (page - 1) * pageSize;
        orders = orders.slice(startIndex, startIndex + pageSize);
      }

      const isFiltered = Boolean(
        options?.search ||
          (options?.status && options.status !== "all") ||
          (options?.region && options.region !== "all") ||
          (options?.category && options.category !== "all") ||
          (options?.range && options.range !== "all") ||
          options?.scope === "page"
      );

      const filename = isFiltered
        ? `urbannest-orders-filtered-${timestamp}.csv`
        : `urbannest-orders-${timestamp}.csv`;

      return {
        filename,
        content: generateCSV(orders, ORDERS_CSV_COLUMNS),
      };
    }

    case "products": {
      const productColumns: CSVColumn<ProductTableRow>[] = [
        { header: "SKU ID", accessor: (p) => p.id },
        { header: "Product Name", accessor: (p) => p.name },
        { header: "Category", accessor: (p) => p.categoryName },
        { header: "Price (₹)", accessor: (p) => p.price.toFixed(2) },
        { header: "Cost (₹)", accessor: (p) => p.cost.toFixed(2) },
        { header: "Stock", accessor: (p) => p.stock },
        { header: "Stock Status", accessor: (p) => p.stockStatus },
        { header: "Units Sold", accessor: (p) => p.unitsSold },
        { header: "Revenue (₹)", accessor: (p) => p.revenue.toFixed(2) },
        { header: "Gross Profit (₹)", accessor: (p) => p.grossProfit.toFixed(2) },
        { header: "Margin (%)", accessor: (p) => p.grossMargin.toFixed(1) },
        { header: "Performance", accessor: (p) => p.performance },
      ];

      const products = getProductTableRows();
      return {
        filename: `urbannest-products-${timestamp}.csv`,
        content: generateCSV(products, productColumns),
      };
    }

    case "customers": {
      const customerColumns: CSVColumn<CustomerTableRow>[] = [
        { header: "Customer ID", accessor: (c) => c.id },
        { header: "Customer Name", accessor: (c) => c.name },
        { header: "Email", accessor: (c) => c.email },
        { header: "Phone", accessor: (c) => c.phone || "" },
        { header: "City", accessor: (c) => c.city || "" },
        { header: "State", accessor: (c) => c.region },
        { header: "Segment", accessor: (c) => c.segment },
        { header: "Total Orders", accessor: (c) => c.ordersCount },
        { header: "Lifetime Spend (₹)", accessor: (c) => c.totalSpend.toFixed(2) },
        { header: "Average Order Value (₹)", accessor: (c) => c.averageOrderValue.toFixed(2) },
        { header: "First Purchase", accessor: (c) => c.firstPurchaseDate },
        { header: "Last Purchase", accessor: (c) => c.lastPurchaseDate || "Never" },
      ];

      const customers = getCustomerTableRows();
      return {
        filename: `urbannest-customers-${timestamp}.csv`,
        content: generateCSV(customers, customerColumns),
      };
    }

    case "analytics": {
      let dateRange: { startDate?: string; endDate?: string } | undefined;
      if (options?.range && options.range !== "all" && isDatePresetKey(options.range)) {
        try {
          const bounds = getFilterDateRange(options.range);
          dateRange = { startDate: bounds.startDate, endDate: bounds.endDate };
        } catch {
          // ignore
        }
      }

      const analyticsFilter: AnalyticsFilter = {
        dateRange,
        regions:
          options?.region && options.region !== "all"
            ? [options.region as Region]
            : undefined,
        categories:
          options?.category && options.category !== "all"
            ? [options.category]
            : undefined,
        statuses:
          options?.status && options.status !== "all"
            ? [options.status as OrderStatus]
            : undefined,
      };

      const metrics = getOverviewMetrics(SEED_DATA, analyticsFilter);
      const categoryBreakdown = getRevenueByCategory(SEED_DATA, analyticsFilter);
      const regionBreakdown = getRevenueByRegion(SEED_DATA, analyticsFilter);
      const statusBreakdown = getOrdersByStatus(SEED_DATA, analyticsFilter);

      const headers = ["Section", "Metric / Dimension", "Value", "Context"];
      const rows: string[][] = [
        [
          "Overview",
          "Total Revenue",
          formatINR(metrics.totalRevenue),
          "Gross Merchandise Value",
        ],
        [
          "Overview",
          "Gross Profit",
          formatINR(metrics.grossProfit),
          `${metrics.grossMargin}% Gross Margin`,
        ],
        ["Overview", "Gross Margin", `${metrics.grossMargin}%`, "Profit / Revenue"],
        [
          "Overview",
          "Total Orders",
          metrics.totalOrders.toLocaleString("en-IN"),
          "Filtered Order Count",
        ],
        [
          "Overview",
          "Average Order Value",
          formatINR(metrics.averageOrderValue),
          "Per Order",
        ],
        [
          "Overview",
          "Products Sold",
          metrics.totalProductsSold.toLocaleString("en-IN"),
          "Total Units Sold",
        ],
        [
          "Overview",
          "Total Customers",
          metrics.totalCustomers.toLocaleString("en-IN"),
          "Active Customer Profiles",
        ],
      ];

      for (const cat of categoryBreakdown) {
        rows.push([
          "Category Breakdown",
          cat.categoryName,
          formatINR(cat.revenue),
          `${cat.percentageOfTotal}% of total (${cat.ordersCount} orders)`,
        ]);
      }

      for (const reg of regionBreakdown) {
        rows.push([
          "Regional Breakdown",
          reg.region,
          formatINR(reg.revenue),
          `${reg.percentageOfTotal}% of total (${reg.ordersCount} orders)`,
        ]);
      }

      for (const stat of statusBreakdown) {
        rows.push([
          "Order Status Breakdown",
          stat.status,
          `${stat.count} orders`,
          `${formatINR(stat.revenue)} total (${stat.percentageOfTotal}%)`,
        ]);
      }

      const csvRows = rows.map((r) => r.map(escapeCSVValue).join(","));

      return {
        filename: `urbannest-analytics-${timestamp}.csv`,
        content: `\uFEFF${headers.map(escapeCSVValue).join(",")}\r\n${csvRows.join("\r\n")}\r\n`,
      };
    }

    default:
      throw new Error(`Unsupported export type: ${type}`);
  }
}
