import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegionBreakdown } from "@/lib/analytics/types";
import { cn, formatINR, formatIndianNumber } from "@/lib/utils";

interface RegionalPerformanceProps {
  data: RegionBreakdown[];
  className?: string;
}

export function RegionalPerformance({
  data,
  className,
}: RegionalPerformanceProps) {
  return (
    <Card className={cn("rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft transition-all duration-200 hover:shadow-soft-lg", className)}>
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-base font-semibold text-foreground tracking-tight">Sales by State</CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Market penetration and gross revenue share across Indian states
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="flex h-48 w-full items-center justify-center text-xs text-muted-foreground">
            No state sales records found.
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => (
              <div key={item.region} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{item.region}</span>
                  <div className="flex items-center gap-2.5 font-mono">
                    <span className="text-muted-foreground text-[11px]">
                      {formatIndianNumber(item.ordersCount)} orders
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatINR(item.revenue, { compact: true })}
                    </span>
                    <span className="w-10 text-right text-[11px] text-muted-foreground font-medium">
                      {item.percentageOfTotal.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary/80">
                  <div
                    className="h-full rounded-full bg-primary/85 transition-all duration-500"
                    style={{ width: `${Math.min(item.percentageOfTotal, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
