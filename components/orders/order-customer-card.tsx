"use client";

import * as React from "react";
import { Check, Copy, Mail, MapPin, Phone, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import type { CustomerSegment } from "@/types/ecommerce";
import type { EnrichedOrderDetail } from "@/types/order-details";

interface OrderCustomerCardProps {
  customer: EnrichedOrderDetail["customer"];
}

function getSegmentBadge(segment: CustomerSegment) {
  switch (segment) {
    case "VIP":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
        >
          VIP
        </Badge>
      );
    case "Returning":
      return <Badge variant="default">Returning</Badge>;
    case "New":
      return <Badge variant="secondary">New</Badge>;
    case "At Risk":
      return <Badge variant="destructive">At Risk</Badge>;
  }
}

export function OrderCustomerCard({ customer }: OrderCustomerCardProps) {
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(customer.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1500);
  };

  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="rounded-2xl border-border/75 shadow-soft bg-card/90 backdrop-blur-sm overflow-hidden">
      <CardHeader className="py-3.5 px-5 border-b border-border/50 bg-muted/15">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            <span>Customer Profile</span>
          </CardTitle>
          {getSegmentBadge(customer.segment)}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Customer Identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            {initials}
          </div>
          <div className="space-y-0.5 min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">
              {customer.name}
            </div>
            <span className="font-mono text-[11px] text-muted-foreground block">
              {customer.id}
            </span>
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="space-y-2.5 pt-2 border-t border-border/60 text-xs">
          {/* Email */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 opacity-60" />
              <span>Email</span>
            </span>
            <div className="flex items-center gap-1.5">
              <a
                href={`mailto:${customer.email}`}
                className="text-foreground hover:underline truncate max-w-[150px]"
              >
                {customer.email}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Copy customer email"
              >
                {copiedEmail ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>

          {/* Phone */}
          {customer.phone && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 opacity-60" />
                <span>Phone</span>
              </span>
              <span className="font-mono text-xs text-foreground">
                {customer.phone}
              </span>
            </div>
          )}

          {/* Location */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 opacity-60" />
              <span>Location</span>
            </span>
            <Badge variant="outline" className="text-xs font-normal border-border/80">
              {customer.city ? `${customer.city}, ${customer.region}` : customer.region}
            </Badge>
          </div>
        </div>

        {/* Lifetime Activity Stats */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-center">
          <div className="rounded-md bg-muted/20 p-2 border border-border/40">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
              Total Orders
            </span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {customer.totalOrdersCount}
            </span>
          </div>

          <div className="rounded-md bg-muted/20 p-2 border border-border/40">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-medium">
              Total Spend
            </span>
            <span className="font-mono text-sm font-semibold text-foreground">
              {formatINR(customer.totalSpend)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
