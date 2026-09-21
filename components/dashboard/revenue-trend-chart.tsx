"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatINR, formatIndianNumber } from "@/lib/utils";
import type { TimeSeriesPoint } from "@/lib/analytics/types";

interface RevenueTrendChartProps {
  data: TimeSeriesPoint[];
  periodLabel: string;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: TimeSeriesPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg text-xs text-[#111827] dark:bg-[#111827] dark:border-slate-800 dark:text-[#F8FAFC] dark:shadow-2xl">
        <p className="font-semibold text-[#111827] dark:text-[#F8FAFC] mb-1.5">{label}</p>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Revenue:</span>
            <span className="text-[#111827] dark:text-[#F8FAFC] font-semibold tabular-nums">
              {formatINR(point.revenue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Orders:</span>
            <span className="text-[#475569] dark:text-[#CBD5E1] font-medium tabular-nums">{formatIndianNumber(point.ordersCount)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Gross Profit:</span>
            <span className="text-[#059669] dark:text-[#10B981] font-semibold tabular-nums">
              {formatINR(point.grossProfit)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function RevenueTrendChart({
  data,
  periodLabel,
  className,
}: RevenueTrendChartProps) {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  const formatXAxis = (tickItem: string) => {
    if (tickItem.length === 7) {
      // YYYY-MM
      const [y, m] = tickItem.split("-");
      const d = new Date(parseInt(y), parseInt(m) - 1, 1);
      const monthName = d.toLocaleDateString("en-IN", { month: "short" });
      return `${monthName} '${y.slice(2)}`;
    }
    // YYYY-MM-DD -> DD/MM
    const parts = tickItem.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return tickItem;
  };

  const formatYAxis = (val: number) => {
    return formatINR(val, { compact: true });
  };

  return (
    <Card className={cn("rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft transition-all duration-200 hover:shadow-soft-lg", className)}>
      <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between p-0 pb-5">
        <div>
          <CardTitle className="text-base font-semibold text-foreground tracking-tight">Revenue Velocity Trend</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Gross transaction volume over {periodLabel}
          </CardDescription>
        </div>
        <div className="text-left sm:text-right pt-2 sm:pt-0">
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Period Gross</div>
          <div className="text-lg font-semibold tracking-tight text-foreground">
            {formatINR(totalRevenue)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-72 w-full">
          {data.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No revenue activity in this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
                    <stop offset="90%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="hsl(var(--border) / 0.5)"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border) / 0.6)" }}
                  tickFormatter={formatXAxis}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  minTickGap={20}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border) / 0.6)" }}
                  tickFormatter={formatYAxis}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "hsl(var(--border) / 0.7)", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
