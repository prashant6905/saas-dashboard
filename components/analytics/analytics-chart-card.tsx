"use client";

import * as React from "react";
import { LucideIcon, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface AnalyticsChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  highlightValue?: string;
  highlightLabel?: string;
  isEmpty?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AnalyticsChartCard({
  title,
  description,
  icon: Icon = BarChart3,
  badge,
  actions,
  highlightValue,
  highlightLabel,
  isEmpty = false,
  emptyMessage = "No analytical data available for the selected filters.",
  isLoading = false,
  className,
  contentClassName,
  children,
  footer,
}: AnalyticsChartCardProps) {
  return (
    <Card className={cn("flex flex-col rounded-3xl border border-border/70 shadow-soft bg-card overflow-hidden p-6", className)}>
      <CardHeader className="flex flex-col gap-2 p-0 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/80 bg-neutral-100 dark:bg-neutral-800 text-foreground shadow-2xs">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-base font-bold tracking-tight text-foreground">
              {title}
            </CardTitle>
            {badge}
          </div>
          {description && (
            <CardDescription className="text-xs text-muted-foreground line-clamp-1">
              {description}
            </CardDescription>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {(highlightValue || highlightLabel) && (
            <div className="text-right hidden sm:block">
              {highlightLabel && (
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {highlightLabel}
                </div>
              )}
              {highlightValue && (
                <div className="text-sm font-bold font-mono tracking-tight text-foreground">
                  {highlightValue}
                </div>
              )}
            </div>
          )}
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      </CardHeader>

      <CardContent className={cn("flex-1 pt-2", contentClassName)}>
        {isLoading ? (
          <div className="h-64 w-full flex items-center justify-center p-4">
            <Skeleton className="h-full w-full rounded-md" />
          </div>
        ) : isEmpty ? (
          <div className="flex h-64 w-full flex-col items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/10 p-6 text-center">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-medium text-foreground">No Records Found</p>
            <p className="mt-1 text-[11px] text-muted-foreground max-w-xs">
              {emptyMessage}
            </p>
          </div>
        ) : (
          children
        )}
      </CardContent>

      {footer && (
        <div className="border-t border-border/50 px-6 py-2.5 bg-muted/10 text-xs text-muted-foreground">
          {footer}
        </div>
      )}
    </Card>
  );
}
