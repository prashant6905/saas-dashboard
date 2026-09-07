import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OrdersTablePaginationProps {
  pageIndex: number; // 1-based
  pageSize: number;
  totalRows: number;
  selectedCount: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  className?: string;
}

export function OrdersTablePagination({
  pageIndex,
  pageSize,
  totalRows,
  selectedCount,
  onPageChange,
  onPageSizeChange,
  className,
}: OrdersTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const startRow = totalRows === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endRow = Math.min(totalRows, pageIndex * pageSize);

  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-border/50 bg-muted/10 ${className ?? ""}`}
    >
      {/* Left side: Selection & Record Range */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {selectedCount > 0 ? (
          <span className="font-medium text-foreground">
            <strong className="font-semibold text-primary">{selectedCount}</strong>{" "}
            of {totalRows.toLocaleString()} order(s) selected
          </span>
        ) : (
          <span>
            Showing <strong className="font-medium text-foreground">{startRow}</strong> to{" "}
            <strong className="font-medium text-foreground">{endRow}</strong> of{" "}
            <strong className="font-medium text-foreground">
              {totalRows.toLocaleString()}
            </strong>{" "}
            orders
          </span>
        )}
      </div>

      {/* Right side: Rows per page & Page Jump */}
      <div className="flex items-center justify-between sm:justify-end gap-4">
        {/* Rows per page dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Rows per page</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs font-mono rounded-lg border-border/70 bg-card/70 hover:bg-card shadow-2xs"
                aria-label="Select rows per page"
              >
                {pageSize}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-20">
              <DropdownMenuRadioGroup
                value={pageSize.toString()}
                onValueChange={(val) => onPageSizeChange(parseInt(val, 10))}
              >
                {[10, 20, 50, 100].map((size) => (
                  <DropdownMenuRadioItem key={size} value={size.toString()}>
                    {size}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page counter & Navigation buttons */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-muted-foreground mr-1.5">
            Page {pageIndex} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(1)}
            disabled={pageIndex <= 1}
            className="h-7 w-7 rounded-lg border-border/70 bg-card/70 hover:bg-card shadow-2xs disabled:opacity-40"
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={pageIndex <= 1}
            className="h-7 w-7 rounded-lg border-border/70 bg-card/70 hover:bg-card shadow-2xs disabled:opacity-40"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={pageIndex >= totalPages}
            className="h-7 w-7 rounded-lg border-border/70 bg-card/70 hover:bg-card shadow-2xs disabled:opacity-40"
            aria-label="Go to next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(totalPages)}
            disabled={pageIndex >= totalPages}
            className="h-7 w-7 rounded-lg border-border/70 bg-card/70 hover:bg-card shadow-2xs disabled:opacity-40"
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
