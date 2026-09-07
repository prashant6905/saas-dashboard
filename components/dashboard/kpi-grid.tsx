import * as React from "react";
import { IndianRupee, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { KpiCard } from "./kpi-card";
import { formatINR, formatIndianNumber } from "@/lib/utils";
import type { OverviewComparison } from "@/lib/analytics/types";

interface KpiGridProps {
  comparison: OverviewComparison;
  comparisonLabel?: string;
}

export function KpiGrid({
  comparison,
  comparisonLabel = "vs previous period",
}: KpiGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      <KpiCard
        title="Total Revenue"
        metric={comparison.revenue}
        formatter={(val) => formatINR(val, { compact: true })}
        comparisonLabel={comparisonLabel}
        icon={IndianRupee}
      />

      <KpiCard
        title="Total Orders"
        metric={comparison.orders}
        formatter={(val) => formatIndianNumber(val)}
        comparisonLabel={comparisonLabel}
        icon={ShoppingCart}
      />

      <KpiCard
        title="Total Customers"
        metric={comparison.customers}
        formatter={(val) => formatIndianNumber(val)}
        comparisonLabel={comparisonLabel}
        icon={Users}
      />

      <KpiCard
        title="Average Order Value"
        metric={comparison.averageOrderValue}
        formatter={(val) =>
          formatINR(val, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })
        }
        comparisonLabel={comparisonLabel}
        icon={TrendingUp}
      />
    </div>
  );
}
