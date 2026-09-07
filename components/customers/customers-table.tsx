"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  UserX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR, formatIndianDate, formatIndianNumber } from "@/lib/utils";
import type { CustomerSegment } from "@/types/ecommerce";
import type {
  CustomerTableRow,
  CustomersTableFilters,
} from "@/types/customers-table";
import { CustomersTableToolbar } from "./customers-table-toolbar";
import { CustomersTablePagination } from "./customers-table-pagination";

function getSegmentBadge(segment: CustomerSegment) {
  switch (segment) {
    case "VIP":
      return (
        <Badge
          variant="outline"
          className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-semibold h-4.5 px-1.5"
        >
          VIP
        </Badge>
      );
    case "Returning":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-medium h-4.5 px-1.5"
        >
          Returning
        </Badge>
      );
    case "New":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-medium h-4.5 px-1.5"
        >
          New
        </Badge>
      );
    case "At Risk":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium h-4.5 px-1.5"
        >
          At Risk
        </Badge>
      );
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatCurrency(val: number): string {
  return formatINR(val);
}

function formatDate(isoDate: string | null): string {
  if (!isoDate) return "Never";
  return formatIndianDate(isoDate);
}

interface CustomersTableProps {
  data: CustomerTableRow[];
  filters: CustomersTableFilters;
  onSearchChange: (search: string) => void;
  onRegionChange: (region: CustomersTableFilters["region"]) => void;
  onSegmentChange: (segment: CustomersTableFilters["segment"]) => void;
  onSortingChange: (
    sortBy: CustomersTableFilters["sortBy"],
    sortOrder: "asc" | "desc"
  ) => void;
  onPaginationChange: (page: number, pageSize?: number) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function CustomersTable({
  data,
  filters,
  onSearchChange,
  onRegionChange,
  onSegmentChange,
  onSortingChange,
  onPaginationChange,
  onClearFilters,
  activeFilterCount,
}: CustomersTableProps) {
  const router = useRouter();

  // Client-side filtering
  const filteredData = React.useMemo(() => {
    return data.filter((row) => {
      // Search filter
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchesName = row.name.toLowerCase().includes(q);
        const matchesEmail = row.email.toLowerCase().includes(q);
        const matchesId = row.id.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId) {
          return false;
        }
      }

      // Region filter
      if (filters.region !== "all" && row.region !== filters.region) {
        return false;
      }

      // Segment filter
      if (filters.segment !== "all" && row.segment !== filters.segment) {
        return false;
      }

      return true;
    });
  }, [data, filters.search, filters.region, filters.segment]);

  // Client-side sorting
  const { sortBy, sortOrder } = filters;
  const sortedData = React.useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let cmp = 0;

      switch (sortBy) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "ordersCount":
          cmp = a.ordersCount - b.ordersCount;
          break;
        case "totalSpend":
          cmp = a.totalSpend - b.totalSpend;
          break;
        case "averageOrderValue":
          cmp = a.averageOrderValue - b.averageOrderValue;
          break;
        case "lastPurchaseDate": {
          const timeA = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
          const timeB = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
          cmp = timeA - timeB;
          break;
        }
        default:
          cmp = 0;
      }

      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortBy, sortOrder]);

  // Client-side pagination
  const totalRows = sortedData.length;
  const paginatedData = React.useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize;
    return sortedData.slice(start, start + filters.pageSize);
  }, [sortedData, filters.page, filters.pageSize]);

  // Sort click handler
  const handleSortClick = (column: CustomersTableFilters["sortBy"]) => {
    if (filters.sortBy === column) {
      onSortingChange(column, filters.sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortingChange(column, "desc");
    }
  };

  const renderSortIcon = (column: CustomersTableFilters["sortBy"]) => {
    if (filters.sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-slate-600/70 dark:text-slate-400/70" />;
    }
    return filters.sortOrder === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 text-primary" />
    );
  };

  return (
    <Card className="rounded-3xl border border-border/70 shadow-soft bg-card overflow-hidden">
      <CardContent className="p-0">
        {/* Table Toolbar */}
        <CustomersTableToolbar
          filters={filters}
          onSearchChange={onSearchChange}
          onRegionChange={onRegionChange}
          onSegmentChange={onSegmentChange}
          onClearFilters={onClearFilters}
          activeFilterCount={activeFilterCount}
        />

        {/* Data Table */}
        <div className="overflow-x-auto border-t border-border/50">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20 text-[11px] font-medium text-muted-foreground uppercase tracking-wider select-none">
                {/* 1. Customer */}
                <th
                  onClick={() => handleSortClick("name")}
                  className="py-3 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer</span>
                    {renderSortIcon("name")}
                  </div>
                </th>

                {/* 2. Email */}
                <th className="py-2.5 px-4">
                  <span>Email</span>
                </th>

                {/* 3. Region */}
                <th className="py-2.5 px-4">
                  <span>Region</span>
                </th>

                {/* 4. Segment */}
                <th className="py-2.5 px-4">
                  <span>Segment</span>
                </th>

                {/* 5. Orders */}
                <th
                  onClick={() => handleSortClick("ordersCount")}
                  className="py-2.5 px-4 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Orders</span>
                    {renderSortIcon("ordersCount")}
                  </div>
                </th>

                {/* 6. Total Spend */}
                <th
                  onClick={() => handleSortClick("totalSpend")}
                  className="py-2.5 px-4 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Spend</span>
                    {renderSortIcon("totalSpend")}
                  </div>
                </th>

                {/* 7. Average Order Value */}
                <th
                  onClick={() => handleSortClick("averageOrderValue")}
                  className="py-2.5 px-4 text-right cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>AOV</span>
                    {renderSortIcon("averageOrderValue")}
                  </div>
                </th>

                {/* 8. Last Purchase */}
                <th
                  onClick={() => handleSortClick("lastPurchaseDate")}
                  className="py-2.5 px-4 cursor-pointer hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Last Purchase</span>
                    {renderSortIcon("lastPurchaseDate")}
                  </div>
                </th>

                {/* Action Column */}
                <th className="py-2.5 px-4 w-10"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/40">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <UserX className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium text-foreground">
                        No customers found
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        No customers match your current search and filtering criteria. Try clearing filters.
                      </p>
                      {activeFilterCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onClearFilters}
                          className="mt-2 text-xs"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((customer) => {
                  const initials = getInitials(customer.name);
                  return (
                    <tr
                      key={customer.id}
                      onClick={() => router.push(`/customers/${customer.id}`)}
                      className="group hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {/* 1. Customer Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary border border-primary/20 shadow-2xs dark:bg-primary/20 dark:text-indigo-300 dark:border-primary/30">
                            {initials}
                          </div>
                          <div>
                            <Link
                              href={`/customers/${customer.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-medium text-foreground hover:underline"
                            >
                              {customer.name}
                            </Link>
                            <div className="font-mono text-[10px] text-muted-foreground">
                              {customer.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Email */}
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                        {customer.email}
                      </td>

                      {/* 3. Region */}
                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-normal h-4.5 px-1.5"
                        >
                          {customer.city ? `${customer.city}, ${customer.region}` : customer.region}
                        </Badge>
                      </td>

                      {/* 4. Segment */}
                      <td className="py-3 px-4">
                        {getSegmentBadge(customer.segment)}
                      </td>

                      {/* 5. Orders Count */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-foreground">
                        {formatIndianNumber(customer.ordersCount)}
                      </td>

                      {/* 6. Total Spend */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                        {formatCurrency(customer.totalSpend)}
                      </td>

                      {/* 7. Average Order Value */}
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        {formatCurrency(customer.averageOrderValue)}
                      </td>

                      {/* 8. Last Purchase */}
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(customer.lastPurchaseDate)}
                      </td>

                      {/* Action Chevron */}
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-foreground dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <CustomersTablePagination
          pageIndex={filters.page}
          pageSize={filters.pageSize}
          totalRows={totalRows}
          onPageChange={(page) => onPaginationChange(page)}
          onPageSizeChange={(pageSize) => onPaginationChange(1, pageSize)}
        />
      </CardContent>
    </Card>
  );
}
