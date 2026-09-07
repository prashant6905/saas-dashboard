import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Unit Economics Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-7 w-32" />
            <div className="flex items-center gap-2 pt-1">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          </Card>
        ))}
      </div>

      {/* Row 1: Trend & Category */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-7 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-7 w-48 rounded-md" />
          </div>
          <Skeleton className="h-72 w-full rounded-md" />
        </Card>

        <Card className="lg:col-span-5 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-7 w-32 rounded-md" />
          </div>
          <Skeleton className="h-72 w-full rounded-md" />
        </Card>
      </div>

      {/* Row 2: Region & Order Status */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-7 w-28 rounded-md" />
          </div>
          <Skeleton className="h-72 w-full rounded-md" />
        </Card>

        <Card className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-72 w-full rounded-md" />
        </Card>
      </div>

      {/* Row 3: Customer Segments & Top Merchandise */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-6 p-5 space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
          <Skeleton className="h-72 w-full rounded-md" />
        </Card>

        <Card className="lg:col-span-6 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <Skeleton className="h-72 w-full rounded-md" />
        </Card>
      </div>
    </div>
  );
}
