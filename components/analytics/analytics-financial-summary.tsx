"use client";

import * as React from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  DollarSign,
  Percent,
  Package,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OverviewComparison, OverviewMetrics } from "@/lib/analytics/types";
import { formatCurrency, formatNumber } from "./chart-theme";

interface AnalyticsFinancialSummaryProps {
  metrics: OverviewMetrics;
  comparison: OverviewComparison;
  comparisonLabel?: string;
  className?: string;
}

export function AnalyticsFinancialSummary({
  metrics,
  comparison,
  comparisonLabel = "vs prior period",
  className,
}: AnalyticsFinancialSummaryProps) {
  const cogs = Math.max(0, metrics.totalRevenue - metrics.grossProfit);
  const avgProfitPerUnit =
    metrics.totalProductsSold > 0
      ? Math.round((metrics.grossProfit / metrics.totalProductsSold) * 100) / 100
      : 0;

  // Margin delta is absolute difference in percentage points
  const marginDelta =
    Math.round(
      (comparison.grossMargin.current - comparison.grossMargin.previous) * 10
    ) / 10;

  const cards = [
    {
      title: "Gross Profit",
      value: formatCurrency(metrics.grossProfit),
      change: comparison.grossProfit.percentageChange,
      changeText:
        comparison.grossProfit.percentageChange !== null
          ? `${comparison.grossProfit.percentageChange > 0 ? "+" : ""}${comparison.grossProfit.percentageChange.toFixed(1)}%`
          : "—",
      subtext: comparisonLabel,
      icon: DollarSign,
      isPositive: (comparison.grossProfit.percentageChange ?? 0) > 0,
      isNegative: (comparison.grossProfit.percentageChange ?? 0) < 0,
    },
    {
      title: "Gross Margin",
      value: `${metrics.grossMargin.toFixed(1)}%`,
      change: marginDelta,
      changeText: `${marginDelta > 0 ? "+" : ""}${marginDelta.toFixed(1)} pts`,
      subtext: `Prior: ${comparison.grossMargin.previous.toFixed(1)}%`,
      icon: Percent,
      isPositive: marginDelta > 0,
      isNegative: marginDelta < 0,
    },
    {
      title: "Cost of Goods Sold (COGS)",
      value: formatCurrency(cogs),
      change: null,
      changeText:
        metrics.totalRevenue > 0
          ? `${((cogs / metrics.totalRevenue) * 100).toFixed(1)}% of revenue`
          : "0%",
      subtext: `Net Rev: ${formatCurrency(metrics.totalRevenue, { compact: true })}`,
      icon: Boxes,
      isPositive: false,
      isNegative: false,
    },
    {
      title: "Units Sold & Unit Profit",
      value: formatNumber(metrics.totalProductsSold),
      change: comparison.productsSold.percentageChange,
      changeText: `${formatCurrency(avgProfitPerUnit)} / unit profit`,
      subtext:
        comparison.productsSold.percentageChange !== null
          ? `${comparison.productsSold.percentageChange > 0 ? "+" : ""}${comparison.productsSold.percentageChange.toFixed(1)}% volume`
          : "Volume stable",
      icon: Package,
      isPositive: (comparison.productsSold.percentageChange ?? 0) > 0,
      isNegative: (comparison.productsSold.percentageChange ?? 0) < 0,
    },
  ];

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="group rounded-3xl border border-border/70 shadow-soft bg-card p-6 transition-all duration-300 hover:shadow-soft-lg hover:border-foreground/20 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-center justify-between pb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800 px-3 py-0.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 border border-neutral-300/40 dark:border-neutral-700/40">
                <Icon className="h-3.5 w-3.5 opacity-80" aria-hidden="true" />
                <span>{card.title}</span>
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-foreground shadow-2xs transition-transform duration-200 group-hover:scale-105 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
            
            <div className="my-2">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {card.value}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap items-center gap-2 text-xs">
              {card.change !== null ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold text-xs",
                    card.isPositive &&
                      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
                    card.isNegative &&
                      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
                    !card.isPositive &&
                      !card.isNegative &&
                      "bg-neutral-100 text-muted-foreground border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
                  )}
                >
                  {card.isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : card.isNegative ? (
                    <ArrowDownRight className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  {card.changeText}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-bold text-xs bg-neutral-100 text-muted-foreground border border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700">
                  {card.changeText}
                </span>
              )}
              <span className="text-muted-foreground text-xs truncate">{card.subtext}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
