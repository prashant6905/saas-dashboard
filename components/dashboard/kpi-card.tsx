import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { MetricComparison } from "@/lib/analytics/types";

interface KpiCardProps {
  title: string;
  metric: MetricComparison;
  formatter?: (val: number) => string;
  comparisonLabel?: string;
  icon: LucideIcon;
  className?: string;
}

export function KpiCard({
  title,
  metric,
  formatter = (v) => v.toLocaleString(),
  comparisonLabel = "vs previous period",
  icon: Icon,
  className,
}: KpiCardProps) {
  const isPositive =
    metric.percentageChange !== null && metric.percentageChange > 0;
  const isNegative =
    metric.percentageChange !== null && metric.percentageChange < 0;
  const isNeutral =
    metric.percentageChange === 0 || metric.percentageChange === null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:border-foreground/20 flex flex-col justify-between",
        className
      )}
    >
      {/* Top Header Row: Metric Title & Icon */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </div>
          <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            {title}
          </span>
        </div>

        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-slate-600 dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-white transition-colors">
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Main Metric Value: 500-600 Weight Hierarchy */}
      <div className="my-4">
        <div className="text-2xl sm:text-[28px] font-[650] sm:font-bold tracking-[-0.025em] tabular-nums font-kpi text-[#0F172A] dark:text-[#F8FAFC]">
          {formatter(metric.current)}
        </div>
      </div>

      {/* Footer: Trend Indicator & Comparison Text */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60">
        <div className="flex items-center gap-2 text-xs">
          {/* Trend Chip */}
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium text-xs tabular-nums",
              isPositive &&
                "bg-emerald-500/10 text-[#059669] dark:text-[#10B981] border border-emerald-500/20",
              isNegative &&
                "bg-rose-500/10 text-[#DC2626] dark:text-[#F43F5E] border border-rose-500/20",
              isNeutral &&
                "bg-neutral-100 text-muted-foreground border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
            )}
          >
            {isPositive && <ArrowUpRight className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />}
            {isNegative && <ArrowDownRight className="h-3 w-3 text-rose-600 dark:text-rose-400" />}
            {isNeutral && <Minus className="h-3 w-3" />}
            <span>
              {metric.percentageChange !== null
                ? `${metric.percentageChange > 0 ? "+" : ""}${metric.percentageChange.toFixed(1)}%`
                : "New"}
            </span>
          </span>

          <span className="text-[#64748B] dark:text-[#94A3B8] text-xs font-normal truncate">
            {comparisonLabel}
          </span>
        </div>

        {/* Mini-Sparkline */}
        <div className="w-12 h-4 shrink-0 opacity-60">
          <svg viewBox="0 0 64 24" className="w-full h-full overflow-visible">
            <path
              d={
                isPositive
                  ? "M 2,18 Q 18,16 28,10 T 48,8 T 62,3"
                  : isNegative
                  ? "M 2,4 Q 18,8 28,14 T 48,16 T 62,20"
                  : "M 2,12 L 62,12"
              }
              fill="none"
              stroke={isPositive ? "#10b981" : isNegative ? "#f43f5e" : "#6366f1"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Card>
  );
}
