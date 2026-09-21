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
import { Users2, Sparkles, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
      <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-lg text-xs text-[#111827] dark:bg-[#111827] dark:border-slate-800 dark:text-[#F8FAFC] dark:shadow-2xl">
        <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-200 dark:border-slate-800/60">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: CHART_COLORS.segment[item.segment] }}
          />
          <p className="font-semibold text-[#111827] dark:text-[#F8FAFC]">{item.segment} Segment</p>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Accounts:</span>
            <span className="font-bold text-[#111827] dark:text-white">
              {formatNumber(item.customerCount)} ({item.percentageOfCustomers}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Revenue Generated:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(item.totalSpend)} ({item.percentageOfRevenue}%)
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Average Spend (LTV):</span>
            <span className="font-medium text-[#111827] dark:text-slate-200">
              {formatCurrency(item.averageSpend)} / customer
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Total Orders:</span>
            <span className="font-medium text-[#111827] dark:text-slate-200">
              {formatNumber(item.ordersCount)} orders
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function getSegmentBadge(segment: string) {
  switch (segment) {
    case "VIP":
      return (
        <Badge
          variant="outline"
          className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold h-4.5 px-1.5"
        >
          VIP
        </Badge>
      );
    case "Returning":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium h-4.5 px-1.5"
        >
          Returning
        </Badge>
      );
    case "New":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium h-4.5 px-1.5"
        >
          New
        </Badge>
      );
    case "At Risk":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium h-4.5 px-1.5"
        >
          At Risk
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[10px] font-medium h-4.5 px-1.5">
          {segment}
        </Badge>
      );
  }
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

  // Best LTV Segment calculation
  const topLtvSegment = React.useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => b.averageSpend - a.averageSpend)[0];
  }, [data]);

  // Top Volume Segment calculation
  const topVolumeSegment = React.useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => b.totalSpend - a.totalSpend)[0];
  }, [data]);

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
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          <span>
            VIP concentration:{" "}
            <strong className="text-[#111827] dark:text-[#F8FAFC]">{vipShareOfCust}%</strong> of buyers generate{" "}
            <strong className="text-emerald-600 dark:text-emerald-400">{vipShareOfRev}%</strong> of total revenue.
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
      <div className="space-y-3.5">
        {/* Recharts Bar Chart */}
        <div className="h-52 sm:h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
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

        {/* Cohort Unit Economics & Value Distribution Table */}
        <div className="pt-2.5 border-t border-border/60">
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[#52627A] dark:text-[#A8B4C7] font-table-header">
              Cohort Economics & Volume Realization
            </span>
            <span className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
              {data.length} Cohorts
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-border/50 bg-muted/10">
            <table className="w-full text-left text-[11px] sm:text-[12px] table-fixed">
              <thead className="border-b border-border/50 bg-muted/20 text-[10px] font-semibold text-[#52627A] dark:text-[#A8B4C7] uppercase tracking-[0.05em] font-table-header">
                <tr>
                  <th className="py-1.5 pl-2.5 pr-1 w-[22%]">Cohort</th>
                  <th className="px-1 py-1.5 text-right w-[20%]">Accounts</th>
                  <th className="px-1 py-1.5 text-right w-[24%]">Revenue</th>
                  <th className="px-1 py-1.5 text-right w-[20%]">Avg LTV</th>
                  <th className="py-1.5 pl-1 pr-2.5 text-right w-[14%]">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono text-[11px] sm:text-[12px]">
                {data.map((cohort) => (
                  <tr
                    key={cohort.segment}
                    className="transition-colors hover:bg-muted/30 group"
                  >
                    <td className="py-1.5 pl-2.5 pr-1 font-sans">
                      <div className="flex items-center">
                        {getSegmentBadge(cohort.segment)}
                      </div>
                    </td>
                    <td className="px-1 py-1.5 text-right">
                      <span className="font-semibold text-[#111827] dark:text-[#F8FAFC]">
                        {formatNumber(cohort.customerCount)}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[#64748B] dark:text-[#94A3B8] ml-0.5 font-sans">
                        ({cohort.percentageOfCustomers}%)
                      </span>
                    </td>
                    <td className="px-1 py-1.5 text-right">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(cohort.totalSpend, { compact: true })}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-[#64748B] dark:text-[#94A3B8] ml-0.5 font-sans">
                        ({cohort.percentageOfRevenue}%)
                      </span>
                    </td>
                    <td className="px-1 py-1.5 text-right font-medium text-[#111827] dark:text-[#F8FAFC]">
                      {formatCurrency(cohort.averageSpend, { compact: true })}
                    </td>
                    <td className="py-1.5 pl-1 pr-2.5 text-right font-medium text-[#111827] dark:text-[#F8FAFC]">
                      {formatNumber(cohort.ordersCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key Executive Insights Strip */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-border/40 bg-muted/15 px-2.5 py-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8]">
              <TrendingUp className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>
                Top Volume: <strong className="text-[#111827] dark:text-[#F8FAFC]">{topVolumeSegment?.segment}</strong> (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{topVolumeSegment?.percentageOfRevenue}%</span> of GMV)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#64748B] dark:text-[#94A3B8]">
              <Sparkles className="h-3 w-3 text-purple-500 shrink-0" />
              <span>
                Highest LTV: <strong className="text-[#111827] dark:text-[#F8FAFC]">{topLtvSegment?.segment}</strong> (
                <span className="font-mono font-semibold text-[#111827] dark:text-[#F8FAFC]">{topLtvSegment ? formatCurrency(topLtvSegment.averageSpend) : '—'}</span> / buyer)
              </span>
            </div>
          </div>
        </div>
      </div>
    </AnalyticsChartCard>
  );
}
