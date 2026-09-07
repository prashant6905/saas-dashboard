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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatINR } from "@/lib/utils";
import type { CategoryBreakdown } from "@/lib/analytics/types";

interface CategorySalesChartProps {
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
      <div className="surface-dark rounded-xl border border-slate-800/80 bg-[#0B1220]/95 p-3 shadow-soft-lg backdrop-blur-md text-xs dark:bg-[#0B1220]/95 dark:border-slate-700/70 dark:shadow-[0_0_25px_-5px_rgba(0,0,0,0.6)]">
        <p className="font-semibold text-slate-100 mb-1.5">{item.categoryName}</p>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Revenue:</span>
            <span className="text-white font-bold">
              {formatINR(item.revenue)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Share:</span>
            <span className="text-slate-200 font-medium">{item.percentageOfTotal}%</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Orders:</span>
            <span className="text-slate-200">{item.ordersCount}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function CategorySalesChart({
  data,
  className,
}: CategorySalesChartProps) {
  // Show top 6 categories for visual balance
  const displayData = data.slice(0, 6);

  const formatYAxis = (name: string) => {
    if (name.length > 14) {
      return `${name.substring(0, 12)}…`;
    }
    return name;
  };

  const formatXAxis = (val: number) => {
    return formatINR(val, { compact: true });
  };

  return (
    <Card className={cn("rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft transition-all duration-200 hover:shadow-soft-lg", className)}>
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold text-foreground tracking-tight">Sales by Category</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Merchandise category distribution ranked by gross volume
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-64 w-full">
          {displayData.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No category sales recorded in this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={displayData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="hsl(var(--border) / 0.5)"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border) / 0.6)" }}
                  tickFormatter={formatXAxis}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="categoryName"
                  tickLine={false}
                  axisLine={{ stroke: "hsl(var(--border) / 0.6)" }}
                  tickFormatter={formatYAxis}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  width={105}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={18}
                  activeBar={{
                    fill: "hsl(var(--primary))",
                    stroke: "rgba(255, 255, 255, 0.35)",
                    strokeWidth: 1,
                    filter: "brightness(1.15)",
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
