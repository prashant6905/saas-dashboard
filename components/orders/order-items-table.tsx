import * as React from "react";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import type { EnrichedOrderItem } from "@/types/order-details";

interface OrderItemsTableProps {
  items: EnrichedOrderItem[];
}

export function OrderItemsTable({ items }: OrderItemsTableProps) {
  return (
    <Card className="rounded-2xl border-border/75 shadow-soft bg-card/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-3.5 px-5 border-b border-border/50 bg-muted/15">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            <span>Order Line Items ({items.length})</span>
          </CardTitle>
          <span className="text-[11px] text-muted-foreground font-mono">
            {items.reduce((sum, i) => sum + i.quantity, 0)} total units
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-border/60 bg-muted/20 text-[11px] font-medium text-muted-foreground uppercase tracking-wider select-none">
              <tr>
                <th className="py-2.5 px-5 font-medium">Product</th>
                <th className="py-2.5 px-4 font-medium text-right">Unit Price</th>
                <th className="py-2.5 px-4 font-medium text-center">Qty</th>
                <th className="py-2.5 px-4 font-medium text-right">Unit Cost</th>
                <th className="py-2.5 px-5 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-muted/30 group"
                >
                  {/* Product Info */}
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col gap-1 min-w-[180px]">
                      <span className="font-semibold text-foreground text-xs leading-snug">
                        {item.productName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-4 px-1 text-[9px] font-normal border-border/80 text-muted-foreground"
                        >
                          {item.categoryName}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground/70">
                          {item.productId}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Unit Price */}
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-foreground">
                    {formatINR(item.unitPrice)}
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 px-4 text-center font-mono text-xs font-medium text-foreground">
                    {item.quantity}
                  </td>

                  {/* Unit Cost */}
                  <td className="py-3.5 px-4 text-right font-mono text-xs text-muted-foreground">
                    {formatINR(item.unitCost)}
                  </td>

                  {/* Line Total */}
                  <td className="py-3.5 px-5 text-right font-mono text-xs font-semibold text-foreground">
                    {formatINR(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
