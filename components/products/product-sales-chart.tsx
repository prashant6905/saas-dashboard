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
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, formatIndianNumber } from "@/lib/utils";
import type { ProductSalesTrendPoint } from "@/types/products-table";

interface ProductSalesChartProps {
  trend: ProductSalesTrendPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: ProductSalesTrendPoint }>;
  label?: string;
  metric: "revenue" | "units";
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg text-xs text-[#111827] dark:bg-[#111827] dark:border-slate-800 dark:text-[#F8FAFC] dark:shadow-2xl">
        <p className="font-semibold text-[#111827] dark:text-[#F8FAFC] mb-1.5">{point.label}</p>
        <div className="space-y-0.5 font-mono text-[11px]">
          <p className="text-[#059669] dark:text-[#10B981] font-semibold tabular-nums">
            Revenue: {formatINR(point.revenue)}
          </p>
          <p className="text-[#475569] dark:text-[#CBD5E1] font-medium tabular-nums">
            Units Sold: {formatIndianNumber(point.units)}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function ProductSalesChart({ trend }: ProductSalesChartProps) {
  const [metric, setMetric] = React.useState<"revenue" | "units">("revenue");

  const totalRevenue = trend.reduce((sum, t) => sum + t.revenue, 0);
  const totalUnits = trend.reduce((sum, t) => sum + t.units, 0);

  return (
    <Card className="rounded-2xl border-border/75 shadow-soft bg-card/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-3.5 px-5 border-b border-border/50 bg-muted/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Sales Velocity & Trajectory</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {metric === "revenue"
                ? `Total Revenue: ${formatINR(totalRevenue)}`
                : `Total Units Sold: ${formatIndianNumber(totalUnits)} units`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/50 p-0.5 rounded-md border border-border/60">
            <Button
              variant={metric === "revenue" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMetric("revenue")}
              className="h-6 px-2 text-xs"
            >
              Revenue (₹)
            </Button>
            <Button
              variant={metric === "units" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMetric("units")}
              className="h-6 px-2 text-xs"
            >
              Units Sold
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-6">
        {trend.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
            No sales activity recorded for this product yet.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={
                        metric === "revenue"
                          ? "var(--color-emerald-500, #10b981)"
                          : "var(--color-primary, #3b82f6)"
                      }
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={
                        metric === "revenue"
                          ? "var(--color-emerald-500, #10b981)"
                          : "var(--color-primary, #3b82f6)"
                      }
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-border/40"
                />
                <XAxis
                  dataKey="label"
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  stroke="currentColor"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    metric === "revenue"
                      ? formatINR(val, { compact: true })
                      : formatIndianNumber(val)
                  }
                  className="text-muted-foreground"
                />
                <Tooltip
                  content={<CustomTooltip metric={metric} />}
                  cursor={{ stroke: "currentColor", strokeWidth: 1, strokeDasharray: "3 3", className: "text-muted-foreground/30" }}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={metric === "revenue" ? "#10b981" : "#3b82f6"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
