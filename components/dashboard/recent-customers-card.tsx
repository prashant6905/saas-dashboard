"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCustomerTableRows } from "@/lib/data/customers";
import type { CustomerTableRow } from "@/types/customers-table";
import { cn, formatINR, formatIndianNumber } from "@/lib/utils";

interface RecentCustomersCardProps {
  customers?: CustomerTableRow[];
  className?: string;
}

function getSegmentBadge(segment: CustomerTableRow["segment"]) {
  switch (segment) {
    case "VIP":
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium"
        >
          VIP
        </Badge>
      );
    case "Returning":
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 font-medium"
        >
          Returning
        </Badge>
      );
    case "New":
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium"
        >
          New
        </Badge>
      );
    case "At Risk":
      return (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 font-medium"
        >
          At Risk
        </Badge>
      );
  }
}

export function RecentCustomersCard({ customers, className }: RecentCustomersCardProps) {
  const customerList = React.useMemo(() => {
    if (customers && customers.length > 0) {
      return customers.slice(0, 5);
    }
    return getCustomerTableRows().slice(0, 5);
  }, [customers]);

  return (
    <Card className={cn("rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft", className)}>
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground tracking-tight">
              Recent Customers
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Active buyers across Indian markets
            </CardDescription>
          </div>
          <Link
            href="/customers"
            className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowUpRight className="h-3 w-3 text-slate-600 dark:text-slate-400" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {customerList.length === 0 ? (
          <div className="flex h-36 w-full items-center justify-center text-xs text-muted-foreground">
            No customers found in this period.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {customerList.map((customer) => {
              const initials = customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              const location = [customer.city, customer.region].filter(Boolean).join(", ");

              return (
                <div
                  key={customer.id}
                  className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 px-2 rounded-xl"
                >
                  {/* Left: Circular Avatar + Name + Region */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-foreground font-semibold text-xs border border-neutral-200/80 dark:border-neutral-700/80">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/customers/${customer.id}`}
                        className="block text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-[200px]"
                      >
                        {customer.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <span className="truncate">{location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Lifetime Spend & Segment */}
                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <div>
                      <div className="font-mono text-xs sm:text-sm font-semibold text-foreground">
                        {formatINR(customer.totalSpend, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatIndianNumber(customer.ordersCount)} orders
                      </div>
                    </div>
                    <div>{getSegmentBadge(customer.segment)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
