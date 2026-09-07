"use client";

import * as React from "react";
import Link from "next/link";
import { Package, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TopProduct } from "@/lib/analytics/types";
import { formatCurrency, formatNumber } from "./chart-theme";
import { AnalyticsChartCard } from "./analytics-chart-card";

interface AnalyticsTopProductsTableProps {
  products: TopProduct[];
  totalRevenue: number;
  className?: string;
}

export function AnalyticsTopProductsTable({
  products,
  totalRevenue,
  className,
}: AnalyticsTopProductsTableProps) {
  return (
    <AnalyticsChartCard
      title="Top Merchandise Performance Matrix"
      description="Highest-velocity products ranked by gross revenue and margin contribution"
      icon={Package}
      badge={
        <Badge variant="outline" className="text-[10px] font-mono">
          Top {products.length} SKUs
        </Badge>
      }
      highlightLabel="Top 10 Volume"
      highlightValue={formatCurrency(
        products.reduce((sum, p) => sum + p.revenue, 0),
        { compact: true }
      )}
      isEmpty={products.length === 0}
      emptyMessage="No product sales recorded for the selected filter set."
      className={className}
      contentClassName="p-0"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border/60 bg-muted/20 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="py-3 pl-4 pr-3">Product</th>
              <th className="px-3 py-3">Category</th>
              <th className="px-3 py-3 text-right">Price / Cost</th>
              <th className="px-3 py-3 text-right">Units Sold</th>
              <th className="px-3 py-3 text-right">Gross Profit</th>
              <th className="px-3 py-3 text-right">Margin %</th>
              <th className="py-3 pl-3 pr-4 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-mono">
            {products.map((item, idx) => {
              const revShare =
                totalRevenue > 0
                  ? Math.round((item.revenue / totalRevenue) * 1000) / 10
                  : 0;

              return (
                <tr
                  key={item.productId}
                  className="transition-colors hover:bg-muted/25 group"
                >
                  <td className="py-2.5 pl-4 pr-3 font-sans">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-muted-foreground w-4">
                        #{idx + 1}
                      </span>
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1 max-w-[180px] sm:max-w-[240px] truncate"
                      >
                        <span className="truncate">{item.name}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-muted-foreground" />
                      </Link>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-sans">
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-normal px-1.5 py-0"
                    >
                      {item.categoryName}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground text-[11px]">
                    <span className="text-foreground font-medium">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-[10px] block opacity-70">
                      cost {formatCurrency(item.cost)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium text-foreground">
                    {formatNumber(item.unitsSold)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-semibold text-indigo-500">
                    {formatCurrency(item.grossProfit)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span
                      className={
                        item.grossMargin >= 50
                          ? "text-emerald-500 font-bold"
                          : item.grossMargin >= 30
                          ? "text-amber-500 font-semibold"
                          : "text-muted-foreground"
                      }
                    >
                      {item.grossMargin.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 pl-3 pr-4 text-right">
                    <div className="font-bold text-foreground">
                      {formatCurrency(item.revenue)}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-sans">
                      {revShare}% of total
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AnalyticsChartCard>
  );
}
