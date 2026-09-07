import * as React from "react";
import type { Metadata } from "next";
import { getOrderDetailById } from "@/lib/data/orders";
import { OrderHeader } from "@/components/orders/order-header";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { OrderItemsTable } from "@/components/orders/order-items-table";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { OrderCustomerCard } from "@/components/orders/order-customer-card";
import { OrderNotFound } from "@/components/orders/order-not-found";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

import { formatINR } from "@/lib/utils";

export async function generateMetadata({
  params,
}: OrderPageProps): Promise<Metadata> {
  const { id } = await params;
  const order = getOrderDetailById(id);

  if (!order) {
    return {
      title: `Order Not Found — UrbanNest`,
    };
  }

  return {
    title: `Order ${order.id} — UrbanNest`,
    description: `Order transaction details for ${order.id} (${order.customer.name}, ${formatINR(order.totalAmount)})`,
  };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  const order = getOrderDetailById(id);

  if (!order) {
    return <OrderNotFound orderId={id} />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with back navigation, status & highlights */}
      <OrderHeader order={order} />

      {/* 2. Fulfillment Lifecycle Timeline */}
      <OrderTimeline
        timeline={order.timeline}
        isCancelled={order.status === "Cancelled"}
      />

      {/* 3. Main Content: 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): Line Items Table & Financial Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <OrderItemsTable items={order.items} />
          <OrderSummaryCard order={order} />
        </div>

        {/* Right (1/3): Customer Profile */}
        <div className="space-y-6">
          <OrderCustomerCard customer={order.customer} />
        </div>
      </div>
    </div>
  );
}
