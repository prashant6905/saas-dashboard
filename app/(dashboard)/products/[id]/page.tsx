import * as React from "react";
import type { Metadata } from "next";
import { getProductDetailById } from "@/lib/data/products";
import { ProductDetailHeader } from "@/components/products/product-detail-header";
import { ProductSalesChart } from "@/components/products/product-sales-chart";
import { ProductRecentOrders } from "@/components/products/product-recent-orders";
import { ProductNotFound } from "@/components/products/product-not-found";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductDetailById(id);

  if (!product) {
    return {
      title: `Product Not Found — UrbanNest`,
    };
  }

  return {
    title: `${product.name} (${product.id}) — UrbanNest`,
    description: `Product merchandise metrics, inventory stock, sales trajectory, and recent orders for ${product.name}.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProductDetailById(id);

  if (!product) {
    return <ProductNotFound productId={id} />;
  }

  return (
    <div className="space-y-6">
      {/* 1. Header with back navigation, SKU, prices, KPIs */}
      <ProductDetailHeader product={product} />

      {/* 2. Monthly Sales Trend Chart */}
      <ProductSalesChart trend={product.salesTrend} />

      {/* 3. Recent Orders Containing SKU */}
      <ProductRecentOrders orders={product.recentOrders} />
    </div>
  );
}
