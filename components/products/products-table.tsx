"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  PackageX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatINR, formatIndianNumber } from "@/lib/utils";
import type {
  ProductPerformance,
  ProductTableRow,
  ProductsTableFilters,
  StockStatus,
} from "@/types/products-table";
import { ProductsTableToolbar } from "./products-table-toolbar";
import { ProductsTablePagination } from "./products-table-pagination";

export function getStockBadge(status: StockStatus, stock: number) {
  switch (status) {
    case "In Stock":
      return (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] h-4.5 px-1.5 font-medium"
          >
            In Stock
          </Badge>
          <span className="font-mono text-[11px] text-[#52627A] dark:text-[#A8B4C7]">
            ({stock})
          </span>
        </div>
      );
    case "Low Stock":
      return (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] h-4.5 px-1.5 font-medium"
          >
            Low Stock
          </Badge>
          <span className="font-mono text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
            ({stock})
          </span>
        </div>
      );
    case "Out of Stock":
      return (
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 text-[10px] h-4.5 px-1.5 font-medium"
          >
            Out of Stock
          </Badge>
          <span className="font-mono text-[11px] text-slate-500 dark:text-muted-foreground/60">
            (0)
          </span>
        </div>
      );
  }
}

export function getPerformanceBadge(perf: ProductPerformance) {
  switch (perf) {
    case "Top Performer":
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] font-semibold h-4.5 px-2"
        >
          Top Performer
        </Badge>
      );
    case "Strong":
      return (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 text-[10px] font-medium h-4.5 px-2"
        >
          Strong
        </Badge>
      );
    case "Average":
      return (
        <Badge
          variant="outline"
          className="border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 text-[10px] font-medium h-4.5 px-2"
        >
          Average
        </Badge>
      );
    case "Underperforming":
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] font-medium h-4.5 px-2"
        >
          Underperforming
        </Badge>
      );
  }
}

export function getCategoryBadge(categoryName: string) {
  let colorClass =
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700";

  switch (categoryName) {
    case "Electronics":
      colorClass =
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50";
      break;
    case "Jewellery & Accessories":
      colorClass =
        "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50";
      break;
    case "Fashion & Apparel":
      colorClass =
        "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50";
      break;
    case "Beauty & Personal Care":
      colorClass =
        "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50";
      break;
    case "Home & Kitchen":
    case "Home Decor":
      colorClass =
        "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/50";
      break;
    case "Footwear":
      colorClass =
        "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50";
      break;
    case "Health & Wellness":
      colorClass =
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50";
      break;
    case "Mobile Accessories":
      colorClass =
        "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50";
      break;
    case "Grocery & Gourmet":
      colorClass =
        "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50";
      break;
    default:
      colorClass =
        "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[11px] font-medium h-5 px-2 whitespace-nowrap transition-colors",
        colorClass
      )}
    >
      {categoryName}
    </Badge>
  );
}

interface ProductsTableProps {
  data: ProductTableRow[];
  filters: ProductsTableFilters;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string | "all") => void;
  onStockChange: (status: StockStatus | "all") => void;
  onPerformanceChange: (performance: ProductPerformance | "all") => void;
  onSortingChange: (
    sortBy: ProductsTableFilters["sortBy"],
    sortOrder: "asc" | "desc"
  ) => void;
  onPaginationChange: (page: number, pageSize?: number) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function ProductsTable({
  data,
  filters,
  onSearchChange,
  onCategoryChange,
  onStockChange,
  onPerformanceChange,
  onSortingChange,
  onPaginationChange,
  onClearFilters,
  activeFilterCount,
}: ProductsTableProps) {
  const router = useRouter();

  // 1. Filter dataset
  const filteredData = React.useMemo(() => {
    let result = data;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    if (filters.category !== "all") {
      result = result.filter((p) => p.categoryId === filters.category);
    }

    if (filters.stockStatus !== "all") {
      result = result.filter((p) => p.stockStatus === filters.stockStatus);
    }

    if (filters.performance !== "all") {
      result = result.filter((p) => p.performance === filters.performance);
    }

    return result;
  }, [data, filters.search, filters.category, filters.stockStatus, filters.performance]);

  // 2. Sort dataset
  const { sortBy, sortOrder } = filters;
  const sortedData = React.useMemo(() => {
    const list = [...filteredData];

    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") {
        cmp = a.name.localeCompare(b.name);
      } else {
        cmp = a[sortBy] - b[sortBy];
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });

    return list;
  }, [filteredData, sortBy, sortOrder]);

  // 3. Paginate dataset
  const totalRows = sortedData.length;
  const paginatedData = React.useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize;
    return sortedData.slice(start, start + filters.pageSize);
  }, [sortedData, filters.page, filters.pageSize]);

  const handleSortClick = (col: ProductsTableFilters["sortBy"]) => {
    if (filters.sortBy === col) {
      onSortingChange(col, filters.sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortingChange(col, "desc");
    }
  };

  const renderSortIndicator = (col: ProductsTableFilters["sortBy"]) => {
    if (filters.sortBy !== col) {
      return <ArrowUpDown className="h-3 w-3 text-slate-500/70 dark:text-slate-400/70" />;
    }
    return filters.sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <Card className="rounded-3xl border border-border/70 shadow-soft bg-card overflow-hidden">
      {/* 1. Filter Toolbar */}
      <ProductsTableToolbar
        filters={filters}
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
        onStockChange={onStockChange}
        onPerformanceChange={onPerformanceChange}
        onClearFilters={onClearFilters}
        activeFilterCount={activeFilterCount}
      />

      {/* 2. Products Data Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto border-t border-border/50">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="border-b border-border/60 bg-muted/20 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em] font-table-header select-none">
              <tr>
                {/* Product Name & SKU */}
                <th className="py-3 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em]">
                  <button
                    type="button"
                    onClick={() => handleSortClick("name")}
                    className="flex items-center gap-1 text-[#52627A] dark:text-[#A8B4C7] hover:text-foreground dark:hover:text-white transition-colors"
                  >
                    <span>Product</span>
                    {renderSortIndicator("name")}
                  </button>
                </th>

                {/* Category */}
                <th className="py-2.5 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em]">Category</th>

                {/* Price */}
                <th className="py-2.5 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em] text-right">
                  <button
                    type="button"
                    onClick={() => handleSortClick("price")}
                    className="flex items-center justify-end w-full gap-1 text-[#52627A] dark:text-[#A8B4C7] hover:text-foreground dark:hover:text-white transition-colors text-right"
                  >
                    <span>Price</span>
                    {renderSortIndicator("price")}
                  </button>
                </th>

                {/* Units Sold */}
                <th className="py-2.5 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em] text-right">
                  <button
                    type="button"
                    onClick={() => handleSortClick("unitsSold")}
                    className="flex items-center justify-end w-full gap-1 text-[#52627A] dark:text-[#A8B4C7] hover:text-foreground dark:hover:text-white transition-colors text-right"
                  >
                    <span>Units Sold</span>
                    {renderSortIndicator("unitsSold")}
                  </button>
                </th>

                {/* Revenue */}
                <th className="py-2.5 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em] text-right">
                  <button
                    type="button"
                    onClick={() => handleSortClick("revenue")}
                    className="flex items-center justify-end w-full gap-1 text-[#52627A] dark:text-[#A8B4C7] hover:text-foreground dark:hover:text-white transition-colors text-right"
                  >
                    <span>Revenue</span>
                    {renderSortIndicator("revenue")}
                  </button>
                </th>

                {/* Gross Profit */}
                <th className="py-2.5 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em] text-right">
                  <button
                    type="button"
                    onClick={() => handleSortClick("grossProfit")}
                    className="flex items-center justify-end w-full gap-1 text-[#52627A] dark:text-[#A8B4C7] hover:text-foreground dark:hover:text-white transition-colors text-right"
                  >
                    <span>Gross Profit</span>
                    {renderSortIndicator("grossProfit")}
                  </button>
                </th>

                {/* Stock Status */}
                <th className="py-2.5 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em]">
                  <button
                    type="button"
                    onClick={() => handleSortClick("stock")}
                    className="flex items-center gap-1 text-[#52627A] dark:text-[#A8B4C7] hover:text-foreground dark:hover:text-white transition-colors"
                  >
                    <span>Stock</span>
                    {renderSortIndicator("stock")}
                  </button>
                </th>

                {/* Performance */}
                <th className="py-2.5 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em]">Performance</th>

                {/* Actions */}
                <th className="py-2.5 px-4 font-medium text-center w-12 text-[#52627A] dark:text-[#A8B4C7]">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
                        <PackageX className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        No products found
                      </p>
                      <p className="text-[11px] text-muted-foreground max-w-xs">
                        No merchandise SKUs matched your search or active filter criteria.
                      </p>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onClearFilters}
                          className="h-7 px-2.5 text-xs mt-2"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((product) => (
                  <tr
                    key={product.id}
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="transition-colors hover:bg-muted/30 dark:hover:bg-slate-800/40 group cursor-pointer"
                  >
                    {/* Product Name & SKU */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5 min-w-[180px] max-w-xs">
                        <Link
                          href={`/products/${product.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-foreground hover:underline text-xs truncate"
                        >
                          {product.name}
                        </Link>
                        <span className="font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                          {product.id}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      {getCategoryBadge(product.categoryName)}
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-mono text-xs text-foreground">
                      {formatINR(product.price)}
                    </td>

                    {/* Units Sold */}
                    <td className="py-3 px-4 text-right font-mono text-xs font-medium text-foreground">
                      {formatIndianNumber(product.unitsSold)}
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-foreground">
                      {formatINR(product.revenue)}
                    </td>

                    {/* Gross Profit */}
                    <td className="py-3 px-4 text-right font-mono text-xs">
                      <div className="font-medium text-emerald-500">
                        {formatINR(product.grossProfit)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {product.grossMargin.toFixed(1)}% margin
                      </div>
                    </td>

                    {/* Stock Status */}
                    <td className="py-3 px-4">
                      {getStockBadge(product.stockStatus, product.stock)}
                    </td>

                    {/* Performance */}
                    <td className="py-3 px-4">
                      {getPerformanceBadge(product.performance)}
                    </td>

                    {/* Actions link */}
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/products/${product.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 dark:text-slate-400 hover:bg-muted hover:text-foreground dark:hover:text-white transition-colors"
                        aria-label={`View details for ${product.name}`}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Pagination Controls */}
        <ProductsTablePagination
          pageIndex={filters.page}
          pageSize={filters.pageSize}
          totalRows={totalRows}
          onPageChange={(p) => onPaginationChange(p)}
          onPageSizeChange={(sz) => onPaginationChange(1, sz)}
        />
      </CardContent>
    </Card>
  );
}
