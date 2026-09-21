import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatINR, formatIndianDate } from "@/lib/utils";
import type { Customer, Order, OrderStatus } from "@/types/ecommerce";

interface RecentOrdersTableProps {
  orders: Order[];
  customerMap: Map<string, Customer>;
  className?: string;
}

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "Delivered":
      return <Badge variant="success">Delivered</Badge>;
    case "Shipped":
      return (
        <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-500">
          Shipped
        </Badge>
      );
    case "Processing":
      return (
        <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-500">
          Processing
        </Badge>
      );
    case "Pending":
      return <Badge variant="neutral">Pending</Badge>;
    case "Cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
  }
}

export function RecentOrdersTable({
  orders,
  customerMap,
  className,
}: RecentOrdersTableProps) {
  const displayOrders = orders.slice(0, 6);

  return (
    <Card className={cn("rounded-2xl border border-border/80 shadow-soft bg-card overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between p-5 sm:p-6 pb-4 border-b border-border/60">
        <div>
          <CardTitle className="text-base font-semibold tracking-tight">Recent Orders</CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">Latest transactions recorded in this period</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-xl border-border/80 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 gap-1.5 h-8 px-3">
          <Link href="/orders">
            <span>View all</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-border/60 bg-muted/20 text-[11px] font-semibold text-[#52627A] dark:text-[#A8B4C7] uppercase tracking-[0.05em] font-table-header">
              <tr>
                <th className="py-3 pl-5 pr-3">Order ID</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 pl-3 pr-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">
                    No orders found in this period.
                  </td>
                </tr>
              ) : (
                displayOrders.map((order) => {
                  const customer = customerMap.get(order.customerId);
                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-muted/25 group"
                    >
                      <td className="py-3 pl-5 pr-3 font-mono text-[13px] font-semibold text-[#4338CA] dark:text-[#A78BFA] tabular-nums">
                        {order.id}
                      </td>
                      <td className="py-3 px-3 text-[13px] font-medium text-foreground">
                        <div className="font-medium text-[#111827] dark:text-[#F8FAFC] text-[13px] truncate max-w-[140px]">
                          {customer?.name ?? "Customer"}
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate max-w-[140px]">
                          {customer?.email ?? order.customerId}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#475569] dark:text-[#CBD5E1] text-[13px] font-medium tabular-nums">
                        {formatIndianDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-[#111827] dark:text-[#F8FAFC] tabular-nums text-[13px]">
                        {formatINR(order.totalAmount)}
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
