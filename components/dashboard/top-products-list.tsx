
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TopProduct } from "@/lib/analytics/types";
import { cn, formatINR, formatIndianNumber } from "@/lib/utils";

interface TopProductsListProps {
  products: TopProduct[];
  className?: string;
}

export function TopProductsList({ products, className }: TopProductsListProps) {
  const displayProducts = products.slice(0, 5);

  return (
    <Card className={cn("rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-soft", className)}>
      <CardHeader className="p-0 pb-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-foreground tracking-tight">
              Popular Products
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Best-performing merchandise in this active period
            </CardDescription>
          </div>
          <Link
            href="/products"
            className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {displayProducts.length === 0 ? (
          <div className="flex h-36 w-full items-center justify-center text-xs text-muted-foreground">
            No product sales recorded in this period.
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {displayProducts.map((product, index) => {
              return (
                <div
                  key={product.productId}
                  className="group flex items-center justify-between gap-3 py-3 transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 px-2 rounded-xl"
                >
                  {/* Left: Product Icon/Thumbnail & Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-muted-foreground group-hover:text-foreground transition-colors border border-neutral-200/60 dark:border-neutral-700/60">
                      <Package className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/products/${product.productId}`}
                        className="block text-xs sm:text-sm font-medium text-foreground hover:text-primary transition-colors truncate max-w-[160px] sm:max-w-[220px]"
                      >
                        {product.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <span className="truncate">{product.categoryName}</span>
                        <span>•</span>
                        <span>{formatIndianNumber(product.unitsSold)} sold</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price & Status */}
                  <div className="flex items-center gap-3 shrink-0 text-right">
                    <div>
                      <div className="font-mono text-xs sm:text-sm font-semibold text-foreground">
                        {formatINR(product.price, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        Rev: {formatINR(product.revenue, { compact: true })}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      In Stock
                    </Badge>
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
