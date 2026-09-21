"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { flexRender, useReactTable } from "@tanstack/react-table";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/table-core";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Copy,
  Eye,
  MoreHorizontal,
  PackageX,
} from "lucide-react";
import { cn, formatINR, formatIndianDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrderStatus } from "@/types/ecommerce";
import type { OrderTableRow, OrdersTableFilters } from "@/types/orders-table";
import { OrdersTableToolbar } from "./orders-table-toolbar";
import { OrdersTablePagination } from "./orders-table-pagination";
import { getFilterDateRange } from "@/lib/filters/date-ranges";

function getStatusBadge(status: OrderStatus) {
  switch (status) {
    case "Delivered":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/15 dark:border-emerald-500/30 font-medium"
        >
          Delivered
        </Badge>
      );
    case "Shipped":
      return (
        <Badge
          variant="outline"
          className="border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400 dark:bg-sky-500/15 dark:border-sky-500/30 font-medium"
        >
          Shipped
        </Badge>
      );
    case "Processing":
      return (
        <Badge
          variant="outline"
          className="border-indigo-500/25 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/15 dark:border-indigo-500/30 font-medium"
        >
          Processing
        </Badge>
      );
    case "Pending":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-500/30 font-medium"
        >
          Pending
        </Badge>
      );
    case "Cancelled":
      return <Badge variant="destructive">Cancelled</Badge>;
  }
}

function formatDateCell(isoDate: string) {
  const date = new Date(isoDate);
  const formatted = formatIndianDate(isoDate);
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { formatted, time };
}

interface OrdersTableProps {
  data: OrderTableRow[];
  filters: OrdersTableFilters;
  onSearchChange: (search: string) => void;
  onStatusChange: (status: OrderStatus | "all") => void;
  onRegionChange: (region: OrderTableRow["region"] | "all") => void;
  onCategoryChange: (category: string | "all") => void;
  onRangeChange: (range: OrdersTableFilters["range"]) => void;
  onSortingChange: (
    sortBy: OrdersTableFilters["sortBy"],
    sortOrder: "asc" | "desc"
  ) => void;
  onPaginationChange: (page: number, pageSize?: number) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

export function OrdersTable({
  data,
  filters,
  onSearchChange,
  onStatusChange,
  onRegionChange,
  onCategoryChange,
  onRangeChange,
  onSortingChange,
  onPaginationChange,
  onClearFilters,
  activeFilterCount,
}: OrdersTableProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // 1. Filter data based on active filters (Search, Status, Region, Category, Date Horizon)
  const filteredData = React.useMemo(() => {
    let result = data;

    // Search Filter (ID, customer name, customer email)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (row) =>
          row.id.toLowerCase().includes(q) ||
          row.customerName.toLowerCase().includes(q) ||
          row.customerEmail.toLowerCase().includes(q)
      );
    }

    // Status Filter
    if (filters.status !== "all") {
      result = result.filter((row) => row.status === filters.status);
    }

    // Region Filter
    if (filters.region !== "all") {
      result = result.filter((row) => row.region === filters.region);
    }

    // Category Filter
    if (filters.category && filters.category !== "all") {
      const cat = filters.category.toLowerCase();
      result = result.filter(
        (row) =>
          row.categoryIds?.some((id) => id.toLowerCase() === cat) ||
          row.categoryNames?.some((name) => name.toLowerCase() === cat)
      );
    }

    // Date Range Filter
    if (filters.range !== "all") {
      const rangeBounds = getFilterDateRange(filters.range);
      const start = new Date(rangeBounds.startDate).getTime();
      const end = new Date(rangeBounds.endDate).getTime();
      result = result.filter((row) => {
        const time = new Date(row.createdAt).getTime();
        return time >= start && time <= end;
      });
    }

    return result;
  }, [data, filters.search, filters.status, filters.region, filters.category, filters.range]);

  // Define Table Columns
  const columns = React.useMemo<ColumnDef<OrderTableRow>[]>(
    () => [
      // Checkbox Selection
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all rows on current page"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label={`Select order ${row.original.id}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },

      // Order ID
      {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => {
          const id = row.getValue("id") as string;
          const isCopied = copiedId === id;

          return (
            <div className="flex items-center gap-1.5 font-mono text-[13px] font-medium text-foreground tabular-nums">
              <Link
                href={`/orders/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:underline text-[#4338CA] dark:text-[#A78BFA] hover:text-[#4338CA]/80 dark:hover:text-[#A78BFA]/80 font-semibold font-mono text-[13px] tabular-nums"
                aria-label={`View details for order ${id}`}
              >
                {id}
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(id, id);
                }}
                className="text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-white transition-colors"
                aria-label={`Copy order ID ${id}`}
              >
                {isCopied ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          );
        },
      },

      // Customer Name & Email
      {
        accessorKey: "customerName",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span>Customer</span>
              {isSorted === "asc" ? (
                <ArrowUp className="h-3 w-3 text-foreground" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-3 w-3 text-foreground" />
              ) : (
                <ArrowUpDown className="h-3 w-3 text-slate-600/70 dark:text-slate-400/70" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const name = row.getValue("customerName") as string;
          const email = row.original.customerEmail;
          const segment = row.original.customerSegment;

          return (
            <div className="flex flex-col min-w-[150px] max-w-[200px]">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-medium text-[#111827] dark:text-[#F8FAFC] text-[13px]">
                  {name}
                </span>
                {segment === "VIP" && (
                  <Badge
                    variant="outline"
                    className="h-4 px-1 text-[9px] border-amber-500/30 text-amber-600 dark:text-amber-400 leading-none"
                  >
                    VIP
                  </Badge>
                )}
              </div>
              <span className="truncate text-xs text-[#64748B] dark:text-[#94A3B8]">
                {email}
              </span>
            </div>
          );
        },
      },

      // Date
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span>Date</span>
              {isSorted === "asc" ? (
                <ArrowUp className="h-3 w-3 text-foreground" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-3 w-3 text-foreground" />
              ) : (
                <ArrowUpDown className="h-3 w-3 text-slate-600/70 dark:text-slate-400/70" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const iso = row.getValue("createdAt") as string;
          const { formatted, time } = formatDateCell(iso);

          return (
            <div className="flex flex-col font-mono text-[11px] min-w-[100px]">
              <span className="text-[#475569] dark:text-[#CBD5E1] text-[13px] font-medium tabular-nums">{formatted}</span>
              <span className="text-[#64748B] dark:text-[#94A3B8] text-[11px] tabular-nums">{time}</span>
            </div>
          );
        },
      },

      // Region
      {
        accessorKey: "region",
        header: "Region",
        cell: ({ row }) => {
          const region = row.getValue("region") as string;
          return (
            <Badge
              variant="outline"
              className="text-[11px] font-normal border-border/80 whitespace-nowrap"
            >
              {region}
            </Badge>
          );
        },
      },

      // Total Amount
      {
        accessorKey: "totalAmount",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center justify-end w-full gap-1 hover:text-foreground transition-colors text-right"
            >
              <span>Amount</span>
              {isSorted === "asc" ? (
                <ArrowUp className="h-3 w-3 text-foreground" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-3 w-3 text-foreground" />
              ) : (
                <ArrowUpDown className="h-3 w-3 text-slate-600/70 dark:text-slate-400/70" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const amount = row.getValue("totalAmount") as number;
          return (
            <div className="text-right font-mono text-[13px] font-semibold text-[#111827] dark:text-[#F8FAFC] tabular-nums">
              {formatINR(amount)}
            </div>
          );
        },
      },

      // Status
      {
        accessorKey: "status",
        header: ({ column }) => {
          const isSorted = column.getIsSorted();
          return (
            <button
              type="button"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <span>Status</span>
              {isSorted === "asc" ? (
                <ArrowUp className="h-3 w-3 text-foreground" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-3 w-3 text-foreground" />
              ) : (
                <ArrowUpDown className="h-3 w-3 text-slate-600/70 dark:text-slate-400/70" />
              )}
            </button>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as OrderStatus;
          return getStatusBadge(status);
        },
      },

      // Actions Column
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const order = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 text-slate-600 dark:text-slate-400 hover:text-foreground dark:hover:text-white"
                  aria-label="Open order actions menu"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/orders/${order.id}`}>
                    <Eye className="h-3.5 w-3.5 mr-2 text-primary" />
                    <span>View order details</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCopy(order.id, order.id)}
                  className="cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 mr-2 text-slate-600 dark:text-slate-400" />
                  <span>Copy Order ID</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleCopy(order.customerEmail, order.id)}
                  className="cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 mr-2 text-slate-600 dark:text-slate-400" />
                  <span>Copy Customer Email</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [copiedId]
  );

  // Sync sorting state with URL filters
  const sorting = React.useMemo<SortingState>(() => {
    return [{ id: filters.sortBy, desc: filters.sortOrder === "desc" }];
  }, [filters.sortBy, filters.sortOrder]);

  const handleSortingChange = React.useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const nextSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;

      if (nextSorting.length > 0) {
        const col = nextSorting[0].id as OrdersTableFilters["sortBy"];
        const ord = nextSorting[0].desc ? "desc" : "asc";
        onSortingChange(col, ord);
      }
    },
    [sorting, onSortingChange]
  );

  // TanStack Table Instance
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: filters.page - 1,
        pageSize: filters.pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <Card className="rounded-3xl border border-border/70 shadow-soft bg-card overflow-hidden">
      {/* 1. Table Toolbar */}
      <OrdersTableToolbar
        filters={filters}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onRegionChange={onRegionChange}
        onCategoryChange={onCategoryChange}
        onRangeChange={onRangeChange}
        onClearFilters={onClearFilters}
        activeFilterCount={activeFilterCount}
        table={table}
        selectedCount={selectedCount}
        onClearSelection={() => setRowSelection({})}
        currentPageRecords={table.getRowModel().rows.map((r) => r.original)}
        allFilteredRecords={filteredData}
      />

      {/* 2. TanStack Table Grid */}
      <CardContent className="p-0">
        <div className="overflow-x-auto border-t border-border/50">
          <table className="w-full text-left text-[13px] border-collapse">
            <thead className="border-b border-border/60 bg-muted/20 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-[0.05em] font-table-header select-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "py-2.5 px-4 font-semibold text-[#52627A] dark:text-[#A8B4C7] font-table-header tracking-[0.05em]",
                        header.id === "select" && "w-10 pr-0",
                        header.id === "actions" && "w-10 text-center"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border/40">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground/60">
                        <PackageX className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        No orders found
                      </p>
                      <p className="text-[11px] text-muted-foreground max-w-xs">
                        No transactions matched your search or active filter
                        criteria.
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
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => router.push(`/orders/${row.original.id}`)}
                    className={cn(
                      "transition-colors hover:bg-muted/30 dark:hover:bg-slate-800/40 group cursor-pointer",
                      row.getIsSelected() && "bg-primary/5 hover:bg-primary/10 dark:bg-primary/15 dark:hover:bg-primary/20"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        onClick={
                          cell.column.id === "select" || cell.column.id === "actions"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                        className={cn(
                          "py-3 px-4",
                          cell.column.id === "select" && "w-10 pr-0",
                          cell.column.id === "actions" && "text-center"
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 3. Table Pagination */}
        <OrdersTablePagination
          pageIndex={filters.page}
          pageSize={filters.pageSize}
          totalRows={filteredData.length}
          selectedCount={selectedCount}
          onPageChange={(newPage) => onPaginationChange(newPage)}
          onPageSizeChange={(newPageSize) =>
            onPaginationChange(1, newPageSize)
          }
        />
      </CardContent>
    </Card>
  );
}
