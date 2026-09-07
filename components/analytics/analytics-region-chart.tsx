"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RegionBreakdown } from "@/lib/analytics/types";
import {
  CHART_COLORS,
  CHART_CURSOR,
  ACTIVE_BAR_CONFIG,
  formatCurrency,
  formatNumber,
} from "./chart-theme";
import { AnalyticsChartCard } from "./analytics-chart-card";

interface AnalyticsRegionChartProps {
  data: RegionBreakdown[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: RegionBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="surface-dark rounded-xl border border-slate-800/80 bg-[#0B1220]/95 p-3 shadow-soft-lg backdrop-blur-md text-xs dark:bg-[#0B1220]/95 dark:border-slate-700/70">
        <p className="font-semibold text-slate-100 mb-1.5 pb-1 border-b border-slate-800/60">
          {item.region}
        </p>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Revenue:</span>
            <span className="font-bold text-white">
              {formatCurrency(item.revenue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Regional Share:</span>
            <span className="font-medium text-emerald-400">
              {item.percentageOfTotal}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Orders Count:</span>
            <span className="font-medium text-slate-200">
              {formatNumber(item.ordersCount)} orders
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Active Customers:</span>
            <span className="font-medium text-slate-200">
              {formatNumber(item.customersCount)} buyers
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function AnalyticsRegionChart({
  data,
  className,
}: AnalyticsRegionChartProps) {
  const [metricMode, setMetricMode] = React.useState<"revenue" | "customers">("revenue");

  const totalRevenue = React.useMemo(
    () => data.reduce((sum, d) => sum + d.revenue, 0),
    [data]
  );
  const totalCustomers = React.useMemo(
    () => data.reduce((sum, d) => sum + d.customersCount, 0),
    [data]
  );

  const actions = (
    <div className="inline-flex rounded-md border border-border/80 bg-muted/40 p-0.5">
      <Button
        variant={metricMode === "revenue" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[11px] font-medium"
        onClick={() => setMetricMode("revenue")}
      >
        Revenue (₹)
      </Button>
      <Button
        variant={metricMode === "customers" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[11px] font-medium"
        onClick={() => setMetricMode("customers")}
      >
        Buyers
      </Button>
    </div>
  );

  return (
    <AnalyticsChartCard
      title="Sales by State"
      description="Geographic revenue distribution and customer penetration across Indian states"
      icon={Globe}
      actions={actions}
      highlightLabel={metricMode === "revenue" ? "Total Revenue" : "Total Buyers"}
      highlightValue={
        metricMode === "revenue"
          ? formatCurrency(totalRevenue, { compact: true })
          : formatNumber(totalCustomers)
      }
      isEmpty={data.length === 0}
      emptyMessage="No regional activity recorded for selected parameters."
      className={className}
      footer={
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Top Indian States</span>
          <span className="font-mono">
            {metricMode === "revenue" ? "REVENUE RANKED" : "DENSITY RANKED"}
          </span>
        </div>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 15, right: 10, left: 10, bottom: 25 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={CHART_COLORS.grid}
            />

            <XAxis
              dataKey="region"
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={35}
            />

            <YAxis
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
              tickFormatter={(val) =>
                metricMode === "revenue"
                  ? formatCurrency(val, { compact: true })
                  : formatNumber(val, true)
              }
            />

            <Tooltip content={<CustomTooltip />} cursor={CHART_CURSOR.bar} />

            <Bar
              dataKey={metricMode === "revenue" ? "revenue" : "customersCount"}
              radius={[4, 4, 0, 0]}
              barSize={24}
              activeBar={ACTIVE_BAR_CONFIG}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`region-cell-${index}`}
                  fill={
                    CHART_COLORS.region[entry.region] ??
                    CHART_COLORS.palette[index % CHART_COLORS.palette.length]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartCard>
  );
}
