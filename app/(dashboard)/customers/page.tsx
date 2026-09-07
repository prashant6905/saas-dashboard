"use client";

import * as React from "react";
import { ShieldCheck, Sparkles, UserCheck, Users } from "lucide-react";
import { ExportButton } from "@/components/export/export-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { getCustomerTableRows } from "@/lib/data/customers";
import { useCustomersTableFilters } from "@/lib/filters/customers-url-sync";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomersTableSkeleton } from "@/components/customers/customers-table-skeleton";
import { formatINR, formatIndianNumber } from "@/lib/utils";

function CustomersPageContent({
  allCustomers,
}: {
  allCustomers: ReturnType<typeof getCustomerTableRows>;
}) {
  const {
    filters,
    setSearch,
    setRegion,
    setSegment,
    setSorting,
    setPagination,
    clearFilters,
    activeFilterCount,
  } = useCustomersTableFilters();

  return (
    <CustomersTable
      data={allCustomers}
      filters={filters}
      onSearchChange={setSearch}
      onRegionChange={setRegion}
      onSegmentChange={setSegment}
      onSortingChange={setSorting}
      onPaginationChange={setPagination}
      onClearFilters={clearFilters}
      activeFilterCount={activeFilterCount}
    />
  );
}

export default function CustomersPage() {
  // Load all 500 enriched customers with real analytics
  const allCustomers = React.useMemo(() => {
    return getCustomerTableRows();
  }, []);

  // Calculate high-level summary KPIs
  const totalCustomers = allCustomers.length;
  const vipCount = allCustomers.filter((c) => c.segment === "VIP").length;
  const totalSpend = allCustomers.reduce((acc, c) => acc + c.totalSpend, 0);
  const avgCustomerSpend =
    totalCustomers > 0 ? totalSpend / totalCustomers : 0;

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Customers"
        description="Buyer profiles, lifetime order velocity, geographic distribution, and account spend analytics."
        badge={
          <Badge
            variant="outline"
            className="text-[10px] font-mono uppercase tracking-wider"
          >
            {formatIndianNumber(totalCustomers)} Accounts
          </Badge>
        }
        actions={<ExportButton type="customers" label="Export Directory" />}
      />

      {/* 2. Top Summary KPI Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {/* Total Profiles */}
        <Card className="border-border/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Total Profiles
            </span>
            <Users className="h-4 w-4 text-muted-foreground/70" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {formatIndianNumber(totalCustomers)}
            </span>
            <span className="text-[11px] text-muted-foreground">registered</span>
          </div>
        </Card>

        {/* VIP Accounts */}
        <Card className="border-border/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              VIP Accounts
            </span>
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {formatIndianNumber(vipCount)}
            </span>
            <span className="text-[11px] text-muted-foreground">
              ({((vipCount / (totalCustomers || 1)) * 100).toFixed(0)}% base)
            </span>
          </div>
        </Card>

        {/* Lifetime Spend */}
        <Card className="border-border/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Directory Revenue
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {formatINR(totalSpend, { compact: true })}
            </span>
            <span className="text-[11px] text-muted-foreground">lifetime</span>
          </div>
        </Card>

        {/* Avg Spend / Account */}
        <Card className="border-border/60 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Avg Lifetime Spend
            </span>
            <UserCheck className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold tracking-tight text-foreground">
              {formatINR(avgCustomerSpend)}
            </span>
            <span className="text-[11px] text-muted-foreground">per account</span>
          </div>
        </Card>
      </div>

      {/* 3. Customers Table Module wrapped in Suspense */}
      <React.Suspense fallback={<CustomersTableSkeleton />}>
        <CustomersPageContent allCustomers={allCustomers} />
      </React.Suspense>
    </div>
  );
}
