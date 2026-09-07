"use client";

import * as React from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StatusBreakdown } from "@/lib/analytics/types";
import {
  CHART_COLORS,
  formatCurrency,
  formatNumber,
} from "./chart-theme";
import { AnalyticsChartCard } from "./analytics-chart-card";

interface AnalyticsOrderStatusChartProps {
  data: StatusBreakdown[];
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: StatusBreakdown }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="surface-dark rounded-xl border border-slate-800/80 bg-[#0B1220]/95 p-2.5 shadow-soft-lg backdrop-blur-md text-xs dark:bg-[#0B1220]/95 dark:border-slate-700/70">
        <div className="flex items-center gap-1.5 mb-1">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CHART_COLORS.status[item.status] }}
          />
          <p className="font-semibold text-slate-100">{item.status}</p>
        </div>
        <div className="space-y-0.5 font-mono text-[11px]">
          <p className="text-slate-400">
            Count: <span className="font-bold text-white">{formatNumber(item.count)}</span> orders
          </p>
          <p className="text-slate-400">
            Share: <span className="font-medium text-slate-200">{item.percentageOfTotal}%</span>
          </p>
          <p className="text-slate-400">
            Value: <span className="font-medium text-slate-200">{formatCurrency(item.revenue)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
}

export function AnalyticsOrderStatusChart({
  data,
  className,
}: AnalyticsOrderStatusChartProps) {
  const totalOrders = React.useMemo(
    () => data.reduce((sum, d) => sum + d.count, 0),
    [data]
  );

  const cancelledEntry = data.find((d) => d.status === "Cancelled");
  const cancelRate =
    totalOrders > 0 && cancelledEntry
      ? Math.round((cancelledEntry.count / totalOrders) * 1000) / 10
      : 0;

  const activeData = React.useMemo(
    () => data.filter((d) => d.count > 0),
    [data]
  );

  return (
    <AnalyticsChartCard
      title="Orders by Fulfillment Status"
      description="Pipeline distribution and fulfillment health across lifecycle stages"
      icon={CheckCircle2}
      badge={
        <Badge
          variant="outline"
          className={
            cancelRate < 5
              ? "text-emerald-500 border-emerald-500/20 text-[10px]"
              : "text-rose-500 border-rose-500/20 text-[10px]"
          }
        >
          {cancelRate}% Cancelled
        </Badge>
      }
      highlightLabel="Total Orders"
      highlightValue={formatNumber(totalOrders)}
      isEmpty={totalOrders === 0}
      emptyMessage="No orders found for the active filter set."
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center h-72">
        {/* Donut Chart */}
        <div className="relative h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={activeData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={88}
                paddingAngle={3}
              >
                {activeData.map((entry) => (
                  <Cell
                    key={`status-pie-${entry.status}`}
                    fill={CHART_COLORS.status[entry.status]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {formatNumber(totalOrders)}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Orders
            </span>
          </div>
        </div>

        {/* Detailed Status Breakdown List */}
        <div className="space-y-2 pr-2">
          {data.map((item) => (
            <div
              key={item.status}
              className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: CHART_COLORS.status[item.status] }}
                />
                <span className="font-medium text-foreground">{item.status}</span>
              </div>

              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-muted-foreground">
                  {formatNumber(item.count)} ({item.percentageOfTotal}%)
                </span>
                <span className="font-semibold text-foreground min-w-[70px] text-right">
                  {formatCurrency(item.revenue, { compact: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsChartCard>
  );
}
