import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomerDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* 1. Header Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-4 w-28" />
        <Card className="border-border/70 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Purchase Chart Skeleton */}
      <Card className="border-border/70">
        <CardHeader className="py-3.5 px-5 border-b border-border/60 bg-muted/10 flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-7 w-32" />
        </CardHeader>
        <CardContent className="p-5">
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>

      {/* 3. Recent Orders Skeleton */}
      <Card className="border-border/70">
        <CardHeader className="py-3.5 px-5 border-b border-border/60 bg-muted/10">
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="p-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
