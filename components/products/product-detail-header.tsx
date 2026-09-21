"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatIndianNumber } from "@/lib/utils";
import { getCategoryBadge } from "./products-table";
import type { ProductDetailViewData } from "@/types/products-table";

interface ProductDetailHeaderProps {
  product: ProductDetailViewData;
}

export function ProductDetailHeader({ product }: ProductDetailHeaderProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(product.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs text-[#475569] dark:text-[#CBD5E1] hover:text-[#111827] dark:hover:text-[#F8FAFC] transition-colors font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Main product identity banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl border border-border/75 bg-card/90 shadow-soft backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-[650] sm:font-bold tracking-[-0.02em] text-[#111827] dark:text-[#F8FAFC] font-heading">
              {product.name}
            </h1>
            <button
              type="button"
              onClick={handleCopyId}
              className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted px-2 py-0.5 rounded-md border border-border/60 transition-colors"
              title="Click to copy product SKU"
            >
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-500 font-sans">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="font-sans">{product.id}</span>
                </>
              )}
            </button>
            {getCategoryBadge(product.categoryName)}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>
              Catalog Price:{" "}
              <strong className="font-mono text-[#111827] dark:text-[#F8FAFC] font-semibold tabular-nums">
                {formatINR(product.price)}
              </strong>
            </span>
            <span>•</span>
            <span>
              Unit Cost:{" "}
              <strong className="font-mono text-muted-foreground font-medium">
                {formatINR(product.cost)}
              </strong>
            </span>
            <span>•</span>
            <span>
              Inventory:{" "}
              <strong className="font-mono text-foreground font-medium">
                {formatIndianNumber(product.stock)} units
              </strong>{" "}
              ({product.stockStatus})
            </span>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t lg:border-t-0 lg:border-l border-border/60 pt-3 lg:pt-0 lg:pl-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Total Revenue
            </span>
            <span className="font-mono text-xl font-bold text-foreground">
              {formatINR(product.totalRevenue)}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Units Sold
            </span>
            <span className="font-mono text-base font-semibold text-foreground">
              {formatIndianNumber(product.unitsSold)}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Gross Profit
            </span>
            <span className="font-mono text-base font-semibold text-emerald-500">
              {formatINR(product.grossProfit)}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {product.grossMargin.toFixed(1)}% margin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
