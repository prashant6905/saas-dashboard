import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold tracking-tight transition-colors focus:outline-none focus:ring-1 focus:ring-ring gap-1.5",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 dark:bg-primary/20 dark:text-indigo-300 dark:border-primary/30",
        secondary:
          "border-border/60 bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        destructive:
          "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20 dark:border-rose-500/30",
        outline:
          "text-foreground border-border/70 bg-card/80 dark:bg-slate-900/50 dark:border-slate-700/70",
        success:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 dark:border-emerald-500/30",
        warning:
          "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/15 dark:border-amber-500/30",
        info:
          "border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-500/15 dark:border-blue-500/30",
        neutral:
          "border-border/70 bg-muted/70 text-muted-foreground dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-300",
        pill:
          "border-neutral-300/80 bg-neutral-200/70 text-neutral-800 dark:bg-neutral-800/90 dark:text-neutral-200 dark:border-neutral-700",
        dark:
          "dark-badge border-white/10 bg-[#181C24] text-[#F8FAFC] shadow-2xs [&_svg]:!text-[#E2E8F0] dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
        "dark-pill":
          "dark-pill border-white/10 bg-[#181C24] text-[#F8FAFC] shadow-2xs [&_svg]:!text-[#E2E8F0] font-semibold dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
        lavender:
          "border-transparent bg-pastel-lavender text-pastel-lavender-fg font-bold",
        lime:
          "border-transparent bg-pastel-lime text-pastel-lime-fg font-bold",
        blue:
          "border-transparent bg-pastel-blue text-pastel-blue-fg font-bold",
        peach:
          "border-transparent bg-pastel-peach text-pastel-peach-fg font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
