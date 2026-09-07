import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TimelineStep } from "@/types/order-details";

interface OrderTimelineProps {
  timeline: TimelineStep[];
  isCancelled?: boolean;
}

function getStepIcon(step: TimelineStep) {
  if (step.status === "Cancelled") {
    return <AlertCircle className="h-4 w-4 text-destructive" />;
  }
  if (step.isCompleted) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (step.isCurrent) {
    return <Clock className="h-4 w-4 text-primary animate-pulse" />;
  }
  return <Circle className="h-3.5 w-3.5 text-muted-foreground/40" />;
}

export function OrderTimeline({ timeline, isCancelled }: OrderTimelineProps) {
  return (
    <Card className="rounded-2xl border-border/75 shadow-soft bg-card/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-3.5 px-5 border-b border-border/50 bg-muted/15">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            <span>Fulfillment Lifecycle</span>
          </CardTitle>
          <span className="text-[11px] text-muted-foreground">
            {isCancelled ? (
              <span className="text-destructive font-medium">Order Cancelled</span>
            ) : (
              <span>Real-time status tracking</span>
            )}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {/* Desktop Horizontal / Mobile Vertical Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          {timeline.map((step) => {
            return (
              <div
                key={step.status}
                className={cn(
                  "relative flex flex-col p-3 rounded-md border transition-colors",
                  step.isCurrent &&
                    "border-primary/40 bg-primary/5 dark:bg-primary/10",
                  step.isCompleted && !step.isCurrent && "border-border/70 bg-card",
                  !step.isCompleted &&
                    "border-border/40 bg-muted/10 opacity-60",
                  step.status === "Cancelled" &&
                    "border-destructive/40 bg-destructive/5"
                )}
              >
                {/* Step Header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center justify-center">
                    {getStepIcon(step)}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      step.status === "Cancelled" && "text-destructive",
                      step.isCurrent && "text-primary",
                      step.isCompleted && !step.isCurrent && "text-foreground",
                      !step.isCompleted && "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {step.description}
                </p>

                {/* Real timestamp if available */}
                {step.timestamp && (
                  <div className="mt-2 pt-2 border-t border-border/40 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3 opacity-60" />
                    <span>
                      {new Date(step.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      •{" "}
                      {new Date(step.timestamp).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
