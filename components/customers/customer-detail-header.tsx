"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Mail, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatIndianDate, formatIndianNumber } from "@/lib/utils";
import type { CustomerSegment } from "@/types/ecommerce";
import type { CustomerDetailViewData } from "@/types/customers-table";

function getSegmentBadge(segment: CustomerSegment) {
  switch (segment) {
    case "VIP":
      return (
        <Badge
          variant="outline"
          className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold px-2 py-0.5"
        >
          VIP
        </Badge>
      );
    case "Returning":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium px-2 py-0.5"
        >
          Returning
        </Badge>
      );
    case "New":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium px-2 py-0.5"
        >
          New
        </Badge>
      );
    case "At Risk":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium px-2 py-0.5"
        >
          At Risk
        </Badge>
      );
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface CustomerDetailHeaderProps {
  customer: CustomerDetailViewData;
}

export function CustomerDetailHeader({ customer }: CustomerDetailHeaderProps) {
  const [copiedId, setCopiedId] = React.useState(false);
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(customer.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(customer.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1500);
  };

  const memberSince = formatIndianDate(customer.createdAt);
  const initials = getInitials(customer.name);

  return (
    <div className="space-y-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-foreground dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
          <span>Back to Customers</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-border/75 bg-card/90 backdrop-blur-sm shadow-soft p-5">
        <div className="flex items-start gap-4">
          {/* Avatar badge */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary border border-primary/20 shadow-2xs">
            {initials}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {customer.name}
              </h1>

              {/* Copyable ID */}
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 rounded border border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-mono text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Copy customer ID"
              >
                {copiedId ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500 font-sans">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span className="font-sans">{customer.id}</span>
                  </>
                )}
              </button>

              {/* Segment badge */}
              {getSegmentBadge(customer.segment)}

              {/* Region badge */}
              <Badge variant="outline" className="text-xs font-normal">
                {customer.city ? `${customer.city}, ${customer.region}` : customer.region}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {/* Copyable email */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1 font-mono hover:text-foreground transition-colors"
                aria-label="Copy customer email"
              >
                <Mail className="h-3 w-3 text-muted-foreground/70" />
                <span>{customer.email}</span>
                {copiedEmail && (
                  <span className="text-emerald-500 text-[10px] ml-1 font-sans">
                    (Copied)
                  </span>
                )}
              </button>
              {customer.phone && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Phone className="h-3 w-3 text-muted-foreground/70" />
                    <span>{customer.phone}</span>
                  </span>
                </>
              )}
              <span>•</span>
              <span>
                Member since{" "}
                <strong className="text-foreground font-medium">
                  {memberSince}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Highlights Strip */}
        <div className="flex flex-wrap items-center gap-5 sm:gap-7 border-t lg:border-t-0 lg:border-l border-border/60 pt-3 lg:pt-0 lg:pl-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Total Spend
            </span>
            <span className="font-mono text-xl font-bold text-foreground">
              {formatINR(customer.totalSpend)}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Total Orders
            </span>
            <span className="font-mono text-xl font-bold text-foreground">
              {formatIndianNumber(customer.totalOrders)}
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
              Avg Order Value
            </span>
            <span className="font-mono text-xl font-bold text-foreground">
              {formatINR(customer.averageOrderValue)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
