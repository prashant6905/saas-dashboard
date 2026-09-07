"use client";

import * as React from "react";
import { ExportButton } from "@/components/export/export-button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { getProductTableRows } from "@/lib/data/products";
import { useProductsTableFilters } from "@/lib/filters/products-url-sync";
import { ProductsTable } from "@/components/products/products-table";
import { ProductsTableSkeleton } from "@/components/products/products-table-skeleton";

function ProductsPageContent({
  allProducts,
}: {
  allProducts: ReturnType<typeof getProductTableRows>;
}) {
  const {
    filters,
    setSearch,
    setCategory,
    setStockStatus,
    setPerformance,
    setSorting,
    setPagination,
    clearFilters,
    activeFilterCount,
  } = useProductsTableFilters();

  return (
    <ProductsTable
      data={allProducts}
      filters={filters}
      onSearchChange={setSearch}
      onCategoryChange={setCategory}
      onStockChange={setStockStatus}
      onPerformanceChange={setPerformance}
      onSortingChange={setSorting}
      onPaginationChange={setPagination}
      onClearFilters={clearFilters}
      activeFilterCount={activeFilterCount}
    />
  );
}

export default function ProductsPage() {
  // Load all 150 enriched products with analytics
  const allProducts = React.useMemo(() => {
    return getProductTableRows();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Products"
        description="Merchandise catalog, SKU inventory levels, cost analysis, and product margin performance."
        badge={
          <Badge
            variant="outline"
            className="text-[10px] font-mono uppercase tracking-wider"
          >
            {allProducts.length} Active SKUs
          </Badge>
        }
        actions={<ExportButton type="products" label="Export Catalog" />}
      />

      {/* 2. Products Table Module wrapped in Suspense */}
      <React.Suspense fallback={<ProductsTableSkeleton />}>
        <ProductsPageContent allProducts={allProducts} />
      </React.Suspense>
    </div>
  );
}
