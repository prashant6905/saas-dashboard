"use client";

import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Users2 } from "lucide-react";
import type { SegmentBreakdown } from "@/lib/analytics/types";
import {
  CHART_COLORS,
  CHART_CURSOR,
  ACTIVE_BAR_CONFIG,
  formatCurrency,
  formatNumber,
} from "./chart-theme";
import { AnalyticsChartCard } from "./analytics-chart-card";

interface AnalyticsCustomerSegmentsChartProps {
  data: SegmentBreakdown[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: SegmentBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="surface-dark rounded-xl border border-slate-800/80 bg-[#0B1220]/95 p-3 shadow-soft-lg backdrop-blur-md text-xs dark:bg-[#0B1220]/95 dark:border-slate-700/70">
        <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-800/60">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CHART_COLORS.segment[item.segment] }}
          />
          <p className="font-semibold text-slate-100">{item.segment} Segment</p>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Accounts:</span>
            <span className="font-bold text-white">
              {formatNumber(item.customerCount)} ({item.percentageOfCustomers}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Revenue Generated:</span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(item.totalSpend)} ({item.percentageOfRevenue}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Average Spend (LTV):</span>
            <span className="font-medium text-slate-200">
              {formatCurrency(item.averageSpend)} / customer
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Total Orders:</span>
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

export function AnalyticsCustomerSegmentsChart({
  data,
  className,
}: AnalyticsCustomerSegmentsChartProps) {
  const totalCustomers = React.useMemo(
    () => data.reduce((sum, d) => sum + d.customerCount, 0),
    [data]
  );

  const vipSegment = data.find((d) => d.segment === "VIP");
  const vipShareOfRev = vipSegment ? vipSegment.percentageOfRevenue : 0;
  const vipShareOfCust = vipSegment ? vipSegment.percentageOfCustomers : 0;

  // Chart data comparing Share of Customers vs Share of Revenue
  const chartData = React.useMemo(() => {
    return data.map((d) => ({
      ...d,
      customerShare: d.percentageOfCustomers,
      revenueShare: d.percentageOfRevenue,
    }));
  }, [data]);

  return (
    <AnalyticsChartCard
      title="Customer Segments Dynamics"
      description="Comparative share of customer base vs. revenue contribution by cohort"
      icon={Users2}
      highlightLabel="Total Customers"
      highlightValue={formatNumber(totalCustomers)}
      isEmpty={totalCustomers === 0}
      emptyMessage="No customer cohort activity within current filter bounds."
      className={className}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>
            VIP concentration:{" "}
            <strong className="text-foreground">{vipShareOfCust}%</strong> of buyers generate{" "}
            <strong className="text-emerald-500">{vipShareOfRev}%</strong> of total revenue.
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "#6366f1" }}
              />
              % of Customers
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "#10b981" }}
              />
              % of Revenue
            </span>
          </div>
        </div>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 15, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={CHART_COLORS.grid}
            />

            <XAxis
              dataKey="segment"
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
            />

            <YAxis
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
              tickFormatter={(val) => `${val}%`}
            />

            <Tooltip content={<CustomTooltip />} cursor={CHART_CURSOR.bar} />

            <Bar
              dataKey="customerShare"
              name="% of Customers"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
              barSize={20}
              activeBar={ACTIVE_BAR_CONFIG}
            />
            <Bar
              dataKey="revenueShare"
              name="% of Revenue"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={20}
              activeBar={ACTIVE_BAR_CONFIG}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartCard>
  );
}
