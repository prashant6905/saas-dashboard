import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function OrdersTableSkeleton() {
  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-60 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t border-border/60">
          {/* Table Header Skeleton */}
          <div className="flex items-center gap-4 border-b border-border/60 bg-muted/20 px-4 py-2.5">
            <Skeleton className="h-4 w-4 rounded-sm" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20 ml-auto" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-6" />
          </div>
          {/* Table Rows Skeleton */}
          <div className="divide-y divide-border/40">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-3 w-24" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-40" />
                </div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-3 w-16 ml-auto" />
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
            ))}
          </div>
        </div>
        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between border-t border-border/60 p-4">
          <Skeleton className="h-3 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
