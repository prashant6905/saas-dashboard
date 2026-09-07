import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";

export function CustomersTableSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        {/* Toolbar skeleton */}
        <div className="flex flex-col gap-3 p-4 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="h-8 w-full max-w-sm rounded-md bg-muted/40 animate-pulse" />
            <div className="h-8 w-28 rounded-md bg-muted/40 animate-pulse" />
            <div className="h-8 w-28 rounded-md bg-muted/40 animate-pulse" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/20">
                <th className="py-2.5 px-4"><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /></th>
                <th className="py-2.5 px-4"><div className="h-4 w-28 bg-muted/50 rounded animate-pulse" /></th>
                <th className="py-2.5 px-4"><div className="h-4 w-16 bg-muted/50 rounded animate-pulse" /></th>
                <th className="py-2.5 px-4"><div className="h-4 w-16 bg-muted/50 rounded animate-pulse" /></th>
                <th className="py-2.5 px-4"><div className="h-4 w-16 bg-muted/50 rounded animate-pulse" /></th>
                <th className="py-2.5 px-4"><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></th>
                <th className="py-2.5 px-4"><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></th>
                <th className="py-2.5 px-4"><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></th>
                <th className="py-2.5 px-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-muted/50 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 bg-muted/50 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-muted/30 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><div className="h-3.5 w-32 bg-muted/40 rounded animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-5 w-20 bg-muted/40 rounded-full animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-5 w-16 bg-muted/40 rounded-full animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-3.5 w-10 bg-muted/40 rounded animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-3.5 w-16 bg-muted/40 rounded animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-3.5 w-14 bg-muted/40 rounded animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-3.5 w-20 bg-muted/40 rounded animate-pulse" /></td>
                  <td className="py-3 px-4"><div className="h-4 w-4 bg-muted/30 rounded animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between p-4 border-t border-border/60">
          <div className="h-4 w-40 bg-muted/40 rounded animate-pulse" />
          <div className="h-7 w-48 bg-muted/40 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
