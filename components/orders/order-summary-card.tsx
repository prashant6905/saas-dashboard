import * as React from "react";
import { CreditCard, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import type { EnrichedOrderDetail } from "@/types/order-details";

interface OrderSummaryCardProps {
  order: EnrichedOrderDetail;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  const subtotal = order.items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <Card className="rounded-2xl border-border/75 shadow-soft bg-card/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-3.5 px-5 border-b border-border/50 bg-muted/15">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Receipt className="h-3.5 w-3.5" />
          <span>Financial Summary</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5 space-y-3.5">
        {/* Payment Method */}
        {order.paymentMethod && (
          <div className="flex items-center justify-between text-xs pb-2 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 opacity-60" />
              <span>Payment Mode</span>
            </span>
            <Badge variant="outline" className="font-mono text-xs font-medium border-border/80">
              {order.paymentMethod}
            </Badge>
          </div>
        )}

        {/* Subtotal */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-mono font-medium text-foreground">
            {formatINR(subtotal)}
          </span>
        </div>

        {/* Cost of Goods Sold */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Cost of Goods (COGS)</span>
          <span className="font-mono text-muted-foreground">
            {formatINR(order.totalCost)}
          </span>
        </div>

        {/* Gross Profit */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Gross Profit</span>
          <div className="text-right">
            <span className="font-mono font-semibold text-emerald-500">
              {formatINR(order.grossProfit)}
            </span>
            <span className="text-[11px] text-muted-foreground ml-1.5">
              ({order.grossMargin.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Shipping & Handling */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Shipping ({order.region})</span>
          <span className="font-mono text-muted-foreground">Free Delivery (₹0.00)</span>
        </div>

        <div className="h-px w-full bg-border/60 my-2" />

        {/* Total Amount */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <span className="font-mono text-lg font-bold text-foreground">
            {formatINR(order.totalAmount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
