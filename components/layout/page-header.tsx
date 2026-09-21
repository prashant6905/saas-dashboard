import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/40 pb-5 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[32px] sm:text-[36px] font-[650] sm:font-bold tracking-[-0.028em] leading-tight text-[#111827] dark:text-[#F8FAFC] font-heading">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="text-xs sm:text-[13px] text-[#475569] dark:text-[#CBD5E1] max-w-2xl leading-relaxed tracking-[-0.01em]">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
