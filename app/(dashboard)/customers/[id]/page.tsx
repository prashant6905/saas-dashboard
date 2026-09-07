import * as React from "react";
import type { Metadata } from "next";
import { getCustomerDetailById } from "@/lib/data/customers";
import { CustomerDetailHeader } from "@/components/customers/customer-detail-header";
import { CustomerPurchaseChart } from "@/components/customers/customer-purchase-chart";
import { CustomerRecentOrders } from "@/components/customers/customer-recent-orders";
import { CustomerNotFound } from "@/components/customers/customer-not-found";

interface CustomerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CustomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const customer = getCustomerDetailById(id);

  if (!customer) {
    return {
      title: "Customer Not Found — UrbanNest",
    };
  }

  return {
    title: `${customer.name} (${customer.id}) — UrbanNest`,
    description: `Customer profile, lifetime spend, order frequency, and transaction history for ${customer.name}.`,
  };
}

export default async function CustomerDetailPage({ params }: CustomerPageProps) {
  const { id } = await params;
  const customer = getCustomerDetailById(id);

  if (!customer) {
    return <CustomerNotFound customerId={id} />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with back navigation, customer profile, lifetime metrics */}
      <CustomerDetailHeader customer={customer} />

      {/* 2. Monthly Purchase History Chart */}
      <CustomerPurchaseChart history={customer.purchaseHistory} />

      {/* 3. Customer Recent Orders Table */}
      <CustomerRecentOrders orders={customer.recentOrders} />
    </div>
  );
}
