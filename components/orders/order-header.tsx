"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR, formatIndianDate } from "@/lib/utils";
import type { OrderStatus } from "@/types/ecommerce";
import type { EnrichedOrderDetail } from "@/types/order-details";

interface OrderHeaderProps {
  order: EnrichedOrderDetail;
}

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "Delivered":
      return <Badge variant="success">Delivered</Badge>;
    case "Shipped":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/25 bg-blue-500/10 text-blue-500 font-medium"
        >
          Shipped
        </Badge>
      );
    case "Processing":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/25 bg-amber-500/10 text-amber-500 font-medium"
        >
          Processing
        </Badge>
      );
    case "Pending":
      return <Badge variant="neutral">Pending</Badge>;
    case "Cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
  }
}

export function OrderHeader({ order }: OrderHeaderProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const date = new Date(order.createdAt);
  const formattedDate = formatIndianDate(order.createdAt);
  const formattedTime = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] dark:text-[#CBD5E1] transition-colors hover:text-[#111827] dark:hover:text-[#F8FAFC]"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
          <span>Back to Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs font-normal text-slate-700 dark:text-slate-300 hover:text-foreground"
            aria-label="Print order receipt"
          >
            <Printer className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
            <span className="hidden sm:inline">Print Receipt</span>
          </Button>
        </div>
      </div>

      {/* Main Order Identity Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border/70 bg-card p-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-[#111827] dark:text-[#F8FAFC] font-mono tabular-nums">
              {order.id}
            </h1>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1 rounded border border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-mono text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Copy order reference ID"
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500 font-sans">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="font-sans">Copy</span>
                </>
              )}
            </button>
            {getStatusBadge(order.status)}
          </div>

          <p className="text-xs text-muted-foreground">
            Placed on <span className="font-medium text-foreground">{formattedDate}</span> at{" "}
            <span className="font-mono text-[11px] text-muted-foreground">{formattedTime}</span>
          </p>
        </div>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Total Amount
            </span>
            <span className="font-mono text-xl font-bold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
              {formatINR(order.totalAmount)}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Items
            </span>
            <span className="font-mono text-base font-semibold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
              {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({order.items.length} unique)
              </span>
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Gross Profit
            </span>
            <span className="font-mono text-base font-semibold text-[#059669] dark:text-[#10B981] tabular-nums">
              {formatINR(order.grossProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
