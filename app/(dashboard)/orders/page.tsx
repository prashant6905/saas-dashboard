"use client";

import * as React from "react";
import { OrdersExportDropdown } from "@/components/export/orders-export-dropdown";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { getOrderTableRows, filterOrderTableRows } from "@/lib/data/orders";
import { useOrdersTableFilters } from "@/lib/filters/orders-url-sync";
import { OrdersTable } from "@/components/orders/orders-table";
import { OrdersTableSkeleton } from "@/components/orders/orders-table-skeleton";

function OrdersPageContent() {
  const {
    filters,
    setSearch,
    setStatus,
    setRegion,
    setCategory,
    setRange,
    setSorting,
    setPagination,
    clearFilters,
    activeFilterCount,
  } = useOrdersTableFilters();

  // Load all 2,000 cached order rows
  const allOrders = React.useMemo(() => {
    return getOrderTableRows();
  }, []);

  // Compute filtered records according to active filters
  const { search, status, region, category, range } = filters;
  const filteredOrders = React.useMemo(() => {
    return filterOrderTableRows(allOrders, { search, status, region, category, range });
  }, [allOrders, search, status, region, category, range]);

  // Current page records slice
  const currentPageOrders = React.useMemo(() => {
    const startIndex = (filters.page - 1) * filters.pageSize;
    return filteredOrders.slice(startIndex, startIndex + filters.pageSize);
  }, [filteredOrders, filters.page, filters.pageSize]);

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Orders"
        description="Comprehensive e-commerce transaction ledger, line-item fulfillment, and status tracking."
        badge={
          <Badge
            variant="outline"
            className="text-[10px] font-mono uppercase tracking-wider"
          >
            {filteredOrders.length !== allOrders.length
              ? `${filteredOrders.length.toLocaleString()} of ${allOrders.length.toLocaleString()} Orders`
              : `${allOrders.length.toLocaleString()} Total Orders`}
          </Badge>
        }
        actions={
          <OrdersExportDropdown
            currentPageRecords={currentPageOrders}
            allFilteredRecords={filteredOrders}
          />
        }
      />

      {/* 2. TanStack Orders Table Module */}
      <OrdersTable
        data={allOrders}
        filters={filters}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onRegionChange={setRegion}
        onCategoryChange={setCategory}
        onRangeChange={setRange}
        onSortingChange={setSorting}
        onPaginationChange={setPagination}
        onClearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <React.Suspense fallback={<OrdersTableSkeleton />}>
      <OrdersPageContent />
    </React.Suspense>
  );
}
