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
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CategoryBreakdown } from "@/lib/analytics/types";
import {
  CHART_COLORS,
  CHART_CURSOR,
  ACTIVE_BAR_CONFIG,
  formatCurrency,
  formatNumber,
} from "./chart-theme";
import { AnalyticsChartCard } from "./analytics-chart-card";

export type CategoryMetricMode = "revenue" | "units" | "orders";

interface AnalyticsCategoryChartProps {
  data: CategoryBreakdown[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: CategoryBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg text-xs text-[#111827] dark:bg-[#111827] dark:border-slate-800 dark:text-[#F8FAFC] dark:shadow-2xl">
        <p className="font-semibold text-slate-100 mb-1.5 pb-1 border-b border-slate-800/60">
          {item.categoryName}
        </p>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Revenue:</span>
            <span className="font-bold text-white">
              {formatCurrency(item.revenue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Market Share:</span>
            <span className="font-medium text-emerald-400">
              {item.percentageOfTotal}% of total
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Units Sold:</span>
            <span className="font-medium text-slate-200">
              {formatNumber(item.unitsSold)} units
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Orders Placed:</span>
            <span className="font-medium text-slate-200">
              {formatNumber(item.ordersCount)} orders
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function AnalyticsCategoryChart({
  data,
  className,
}: AnalyticsCategoryChartProps) {
  const [metricMode, setMetricMode] = React.useState<CategoryMetricMode>("revenue");

  const totalRevenue = React.useMemo(
    () => data.reduce((sum, d) => sum + d.revenue, 0),
    [data]
  );
  const totalUnits = React.useMemo(
    () => data.reduce((sum, d) => sum + d.unitsSold, 0),
    [data]
  );

  // Sort and pick top 8 categories according to selected metric
  const sortedData = React.useMemo(() => {
    const sorted = [...data].sort((a, b) => {
      if (metricMode === "revenue") return b.revenue - a.revenue;
      if (metricMode === "units") return b.unitsSold - a.unitsSold;
      return b.ordersCount - a.ordersCount;
    });
    return sorted.slice(0, 8);
  }, [data, metricMode]);

  const actions = (
    <div className="inline-flex rounded-md border border-border/80 bg-muted/40 p-0.5">
      <Button
        variant={metricMode === "revenue" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[11px] font-medium"
        onClick={() => setMetricMode("revenue")}
      >
        Revenue
      </Button>
      <Button
        variant={metricMode === "units" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[11px] font-medium"
        onClick={() => setMetricMode("units")}
      >
        Units
      </Button>
      <Button
        variant={metricMode === "orders" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[11px] font-medium"
        onClick={() => setMetricMode("orders")}
      >
        Orders
      </Button>
    </div>
  );

  const formatXAxis = (val: number) => {
    if (metricMode === "revenue") {
      return formatCurrency(val, { compact: true });
    }
    return formatNumber(val, true);
  };

  const formatYAxis = (name: string) => {
    if (name.length > 13) {
      return `${name.substring(0, 11)}…`;
    }
    return name;
  };

  return (
    <AnalyticsChartCard
      title="Revenue by Category"
      description="Merchandise category distribution and volume penetration"
      icon={Layers}
      actions={actions}
      highlightLabel={
        metricMode === "revenue" ? "Total Revenue" : "Total Units"
      }
      highlightValue={
        metricMode === "revenue"
          ? formatCurrency(totalRevenue, { compact: true })
          : formatNumber(totalUnits, true)
      }
      isEmpty={data.length === 0}
      emptyMessage="No category transactions found for current filter selection."
      className={className}
      footer={
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Displaying top {sortedData.length} product lines</span>
          <span className="font-mono">
            {metricMode.toUpperCase()} RANKED
          </span>
        </div>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={sortedData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke={CHART_COLORS.grid}
            />

            <XAxis
              type="number"
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
              tickFormatter={formatXAxis}
            />

            <YAxis
              type="category"
              dataKey="categoryName"
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
              tickFormatter={formatYAxis}
              width={85}
            />

            <Tooltip content={<CustomTooltip />} cursor={CHART_CURSOR.bar} />

            <Bar
              dataKey={
                metricMode === "revenue"
                  ? "revenue"
                  : metricMode === "units"
                  ? "unitsSold"
                  : "ordersCount"
              }
              radius={[0, 4, 4, 0]}
              barSize={18}
              activeBar={ACTIVE_BAR_CONFIG}
            >
              {sortedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS.palette[index % CHART_COLORS.palette.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartCard>
  );
}
