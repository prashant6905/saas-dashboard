import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductsTableSkeleton() {
  return (
    <Card className="border-border/70 overflow-hidden">
      {/* Toolbar Skeleton */}
      <CardHeader className="p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      </CardHeader>

      {/* Table Skeleton */}
      <CardContent className="p-0">
        <div className="overflow-x-auto border-t border-border/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="border-b border-border/60 bg-muted/20">
              <tr>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-28" /></th>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-20" /></th>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-16" /></th>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-16" /></th>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-20" /></th>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-20" /></th>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-16" /></th>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-20" /></th>
                <th className="py-2.5 px-4"><Skeleton className="h-3 w-10" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="py-3 px-4">
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-14" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-12" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-5 w-20" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-5 w-24" /></td>
                  <td className="py-3 px-4"><Skeleton className="h-6 w-6 rounded-md" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between p-4 border-t border-border/60">
          <Skeleton className="h-4 w-36" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
