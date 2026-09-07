import * as React from "react";
import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR, formatIndianDate } from "@/lib/utils";
import type { ProductRecentOrder } from "@/types/products-table";

interface ProductRecentOrdersProps {
  orders: ProductRecentOrder[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case "Delivered":
      return <Badge variant="success" className="text-[10px] h-4.5 px-1.5">Delivered</Badge>;
    case "Shipped":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/25 bg-blue-500/10 text-blue-500 font-medium text-[10px] h-4.5 px-1.5"
        >
          Shipped
        </Badge>
      );
    case "Processing":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/25 bg-amber-500/10 text-amber-500 font-medium text-[10px] h-4.5 px-1.5"
        >
          Processing
        </Badge>
      );
    case "Pending":
      return <Badge variant="neutral" className="text-[10px] h-4.5 px-1.5">Pending</Badge>;
    case "Cancelled":
      return <Badge variant="destructive" className="text-[10px] h-4.5 px-1.5">Cancelled</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px] h-4.5 px-1.5">{status}</Badge>;
  }
}

export function ProductRecentOrders({ orders }: ProductRecentOrdersProps) {
  return (
    <Card className="rounded-2xl border-border/75 shadow-soft bg-card/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-3.5 px-5 border-b border-border/50 bg-muted/15">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Recent Orders Containing SKU ({orders.length})</span>
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            Latest line-item transactions
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No orders have included this product yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="border-b border-border/60 bg-muted/20 text-[11px] font-medium text-muted-foreground uppercase tracking-wider select-none">
                <tr>
                  <th className="py-2.5 px-5 font-medium">Order ID</th>
                  <th className="py-2.5 px-4 font-medium">Customer</th>
                  <th className="py-2.5 px-4 font-medium">Date</th>
                  <th className="py-2.5 px-4 font-medium text-center">Qty</th>
                  <th className="py-2.5 px-4 font-medium text-right">Price</th>
                  <th className="py-2.5 px-4 font-medium text-right">Line Total</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {orders.map((order) => {
                  const formattedDate = formatIndianDate(order.date);

                  return (
                    <tr
                      key={order.orderId}
                      className="transition-colors hover:bg-muted/30 group"
                    >
                      {/* Order ID */}
                      <td className="py-3 px-5">
                        <Link
                          href={`/orders/${order.orderId}`}
                          className="font-mono text-xs font-semibold text-primary hover:underline"
                        >
                          {order.orderId}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col min-w-[130px] max-w-[180px]">
                          <span className="font-medium text-foreground text-xs truncate">
                            {order.customerName}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {order.customerEmail}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {formattedDate}
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-center font-mono text-xs font-medium text-foreground">
                        {order.quantity}
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-4 text-right font-mono text-xs text-foreground">
                        {formatINR(order.unitPrice)}
                      </td>

                      {/* Line Total */}
                      <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-foreground">
                        {formatINR(order.lineTotal)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {getStatusBadge(order.status)}
                      </td>

                      {/* Link action */}
                      <td className="py-3 px-4 text-center">
                        <Link
                          href={`/orders/${order.orderId}`}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
                          aria-label={`View order ${order.orderId}`}
                        >
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
