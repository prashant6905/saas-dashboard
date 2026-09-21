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
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR, formatIndianNumber } from "@/lib/utils";
import type { CustomerPurchaseTrendPoint } from "@/types/customers-table";

interface CustomerPurchaseChartProps {
  history: CustomerPurchaseTrendPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: CustomerPurchaseTrendPoint }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg text-xs text-[#111827] dark:bg-[#111827] dark:border-slate-800 dark:text-[#F8FAFC] dark:shadow-2xl">
        <p className="font-semibold text-[#111827] dark:text-[#F8FAFC] mb-1.5">{point.label}</p>
        <div className="space-y-0.5 font-mono text-[11px]">
          <p className="text-[#059669] dark:text-[#10B981] font-semibold tabular-nums">
            Spend: {formatINR(point.spend)}
          </p>
          <p className="text-[#475569] dark:text-[#CBD5E1] font-medium tabular-nums">
            Orders: {formatIndianNumber(point.ordersCount)}
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function CustomerPurchaseChart({ history }: CustomerPurchaseChartProps) {
  const [metric, setMetric] = React.useState<"spend" | "orders">("spend");

  const totalSpend = history.reduce((sum, h) => sum + h.spend, 0);
  const totalOrders = history.reduce((sum, h) => sum + h.ordersCount, 0);

  return (
    <Card className="rounded-2xl border-border/75 shadow-soft bg-card/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-3.5 px-5 border-b border-border/50 bg-muted/15">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Purchase History & Frequency</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {metric === "spend"
                ? `Total Lifetime Spend: ${formatINR(totalSpend)}`
                : `Total Placed Orders: ${formatIndianNumber(totalOrders)} orders`}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/50 p-0.5 rounded-md border border-border/60">
            <Button
              variant={metric === "spend" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMetric("spend")}
              className="h-6 px-2 text-xs"
            >
              Spend (₹)
            </Button>
            <Button
              variant={metric === "orders" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMetric("orders")}
              className="h-6 px-2 text-xs"
            >
              Orders Count
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-6">
        {history.length === 0 ? (
          <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
            No order history recorded for this customer yet.
          </div>
        ) : (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={history}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border/40"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  stroke="currentColor"
                  className="text-[11px] text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="currentColor"
                  className="text-[11px] text-muted-foreground font-mono"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    metric === "spend"
                      ? formatINR(val, { compact: true })
                      : formatIndianNumber(val)
                  }
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: "hsl(var(--border) / 0.7)", strokeWidth: 1, strokeDasharray: "3 3" }}
                />
                <Area
                  type="monotone"
                  dataKey={metric === "spend" ? "spend" : "ordersCount"}
                  stroke={metric === "spend" ? "hsl(var(--primary))" : "#10b981"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={metric === "spend" ? "url(#spendGradient)" : "url(#ordersGradient)"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
