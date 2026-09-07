"use client";

import * as React from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TimeSeriesPoint } from "@/lib/analytics/types";
import {
  CHART_COLORS,
  CHART_CURSOR,
  formatCurrency,
  formatDateTick,
  formatNumber,
} from "./chart-theme";
import { AnalyticsChartCard } from "./analytics-chart-card";

export type TrendMetricMode = "revenue_profit" | "revenue_orders" | "margin_pct";

interface AnalyticsRevenueTrendChartProps {
  data: TimeSeriesPoint[];
  periodLabel: string;
  className?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; payload: TimeSeriesPoint }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    const margin =
      point.revenue > 0
        ? Math.round((point.grossProfit / point.revenue) * 1000) / 10
        : 0;
    const cogs = Math.max(0, point.revenue - point.grossProfit);

    return (
      <div className="surface-dark rounded-xl border border-slate-800/80 bg-[#0B1220]/95 p-3 shadow-soft-lg backdrop-blur-md text-xs dark:bg-[#0B1220]/95 dark:border-slate-700/70">
        <p className="font-semibold text-slate-100 mb-1.5 pb-1 border-b border-slate-800/60">
          {label}
        </p>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.revenue }}
              />
              Revenue:
            </span>
            <span className="font-bold text-white">
              {formatCurrency(point.revenue)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.profit }}
              />
              Gross Profit:
            </span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(point.grossProfit)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.cogs }}
              />
              COGS:
            </span>
            <span className="text-slate-300">
              {formatCurrency(cogs)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800/60">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.margin }}
              />
              Gross Margin:
            </span>
            <span className="font-semibold text-amber-400">
              {margin.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.orders }}
              />
              Orders Placed:
            </span>
            <span className="font-medium text-slate-200">
              {formatNumber(point.ordersCount)} orders
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function AnalyticsRevenueTrendChart({
  data,
  periodLabel,
  className,
}: AnalyticsRevenueTrendChartProps) {
  const [metricMode, setMetricMode] = React.useState<TrendMetricMode>("revenue_profit");

  const totalRevenue = React.useMemo(
    () => data.reduce((sum, d) => sum + d.revenue, 0),
    [data]
  );
  const totalProfit = React.useMemo(
    () => data.reduce((sum, d) => sum + d.grossProfit, 0),
    [data]
  );
  const overallMargin =
    totalRevenue > 0
      ? Math.round((totalProfit / totalRevenue) * 1000) / 10
      : 0;

  // Enrich data with computed margin % for margin line mode
  const enrichedData = React.useMemo(() => {
    return data.map((d) => ({
      ...d,
      marginPct:
        d.revenue > 0 ? Math.round((d.grossProfit / d.revenue) * 1000) / 10 : 0,
    }));
  }, [data]);

  const highlightText =
    metricMode === "revenue_profit"
      ? formatCurrency(totalRevenue)
      : metricMode === "margin_pct"
      ? `${overallMargin.toFixed(1)}% Margin`
      : `${formatNumber(data.reduce((sum, d) => sum + d.ordersCount, 0))} Orders`;

  const actions = (
    <div className="inline-flex rounded-md border border-border/80 bg-muted/40 p-0.5">
      <Button
        variant={metricMode === "revenue_profit" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[11px] font-medium"
        onClick={() => setMetricMode("revenue_profit")}
      >
        Revenue & Profit
      </Button>
      <Button
        variant={metricMode === "margin_pct" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[11px] font-medium"
        onClick={() => setMetricMode("margin_pct")}
      >
        Margin %
      </Button>
      <Button
        variant={metricMode === "revenue_orders" ? "secondary" : "ghost"}
        size="sm"
        className="h-7 px-2 text-[11px] font-medium"
        onClick={() => setMetricMode("revenue_orders")}
      >
        Revenue & Orders
      </Button>
    </div>
  );

  return (
    <AnalyticsChartCard
      title="Revenue & Profit Velocity Trend"
      description={`Chronological velocity over ${periodLabel} with dual-metric analysis`}
      icon={TrendingUp}
      actions={actions}
      highlightLabel={
        metricMode === "revenue_profit"
          ? "Total Volume"
          : metricMode === "margin_pct"
          ? "Avg Margin"
          : "Total Orders"
      }
      highlightValue={highlightText}
      isEmpty={data.length === 0}
      emptyMessage="No transaction data captured within this date range and filter criteria."
      className={className}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CHART_COLORS.revenue }}
              />
              Revenue (₹)
            </span>
            {metricMode === "revenue_profit" && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.profit }}
                />
                Gross Profit (₹)
              </span>
            )}
            {metricMode === "revenue_orders" && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.orders }}
                />
                Orders Placed (Qty)
              </span>
            )}
            {metricMode === "margin_pct" && (
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: CHART_COLORS.margin }}
                />
                Gross Margin (%)
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            {data.length} sample periods
          </span>
        </div>
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={enrichedData}
            margin={{ top: 10, right: 15, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="analyticsRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.revenue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS.revenue} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="analyticsProfitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.profit} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART_COLORS.profit} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="analyticsMarginGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS.margin} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CHART_COLORS.margin} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={CHART_COLORS.grid}
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
              tickFormatter={formatDateTick}
              minTickGap={24}
            />

            <YAxis
              yAxisId="left"
              tickLine={false}
              axisLine={{ stroke: CHART_COLORS.grid }}
              tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
              tickFormatter={(val) =>
                metricMode === "margin_pct" ? `${val}%` : formatCurrency(val, { compact: true })
              }
            />

            {metricMode === "revenue_orders" && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={{ stroke: CHART_COLORS.grid }}
                tick={{ fontSize: 11, fill: CHART_COLORS.axisText }}
                tickFormatter={(val) => formatNumber(val, true)}
              />
            )}

            <Tooltip content={<CustomTooltip />} cursor={CHART_CURSOR.line} />

            {metricMode === "revenue_profit" && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2}
                  fill="url(#analyticsRevGrad)"
                  name="Revenue"
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="grossProfit"
                  stroke={CHART_COLORS.profit}
                  strokeWidth={2}
                  fill="url(#analyticsProfitGrad)"
                  name="Gross Profit"
                />
              </>
            )}

            {metricMode === "margin_pct" && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="marginPct"
                  stroke={CHART_COLORS.margin}
                  strokeWidth={2.5}
                  fill="url(#analyticsMarginGrad)"
                  name="Gross Margin %"
                />
              </>
            )}

            {metricMode === "revenue_orders" && (
              <>
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2}
                  fill="url(#analyticsRevGrad)"
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ordersCount"
                  stroke={CHART_COLORS.orders}
                  strokeWidth={2}
                  dot={false}
                  name="Orders Count"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsChartCard>
  );
}
