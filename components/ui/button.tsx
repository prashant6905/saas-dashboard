import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-2xs hover:bg-primary/90 [&_svg]:!text-primary-foreground",
        dark:
          "surface-dark bg-[#181C24] text-white border border-white/10 shadow-2xs hover:bg-[#232834] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 [&_svg]:!text-[#F8FAFC] dark:[&_svg]:!text-neutral-800",
        black:
          "surface-dark bg-[#181C24] text-white border border-white/10 shadow-2xs hover:bg-[#232834] dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 [&_svg]:!text-[#F8FAFC] dark:[&_svg]:!text-neutral-800",
        destructive:
          "bg-destructive text-destructive-foreground shadow-2xs hover:bg-destructive/90 [&_svg]:text-destructive-foreground",
        outline:
          "border border-border/70 bg-card/70 hover:bg-card hover:border-border text-foreground shadow-2xs [&_svg]:text-slate-700 dark:[&_svg]:text-slate-300",
        secondary:
          "bg-secondary/70 text-secondary-foreground shadow-2xs hover:bg-secondary [&_svg]:text-secondary-foreground",
        ghost:
          "hover:bg-accent/60 hover:text-accent-foreground [&_svg]:text-slate-700 dark:[&_svg]:text-slate-300",
        link:
          "text-primary underline-offset-4 hover:underline",
        subtle:
          "bg-accent/50 text-foreground hover:bg-accent border border-border/40 [&_svg]:text-slate-700 dark:[&_svg]:text-slate-300",
        pill:
          "rounded-full border border-neutral-300 dark:border-neutral-700 bg-background hover:bg-neutral-100 dark:hover:bg-neutral-800 text-foreground font-semibold shadow-2xs [&_svg]:text-slate-700 dark:[&_svg]:text-slate-300",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 rounded-lg px-2.5 text-[11px]",
        lg: "h-9 rounded-xl px-4 text-sm",
        icon: "h-8 w-8 rounded-lg",
        "icon-sm": "h-7 w-7 rounded-lg",
        pill: "h-8.5 rounded-full px-4 text-xs font-semibold",
        "pill-sm": "h-7 rounded-full px-3 text-[11px] font-semibold",
        circle: "h-8 w-8 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
