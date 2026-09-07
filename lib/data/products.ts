import { SEED_DATA } from "./seed-data";
import type {
  ProductDetailViewData,
  ProductPerformance,
  ProductRecentOrder,
  ProductSalesTrendPoint,
  ProductTableRow,
  StockStatus,
} from "@/types/products-table";

let cachedProductRows: ProductTableRow[] | null = null;
const cachedDetailMap = new Map<string, ProductDetailViewData>();

/**
 * Returns all 150 products enriched with aggregated line-item sales,
 * revenue, profit margins, stock statuses, and performance ratings.
 */
export function getProductTableRows(): ProductTableRow[] {
  if (cachedProductRows) {
    return cachedProductRows;
  }

  const categoryMap = new Map(SEED_DATA.categories.map((c) => [c.id, c.name]));

  // Find non-cancelled orders
  const validOrderMap = new Map(
    SEED_DATA.orders
      .filter((o) => o.status !== "Cancelled")
      .map((o) => [o.id, o])
  );

  // Aggregate stats per product
  const statsMap = new Map<
    string,
    { unitsSold: number; revenue: number; orderIds: Set<string> }
  >();

  for (const item of SEED_DATA.orderItems) {
    if (!validOrderMap.has(item.orderId)) continue;
    const curr = statsMap.get(item.productId) ?? {
      unitsSold: 0,
      revenue: 0,
      orderIds: new Set<string>(),
    };
    curr.unitsSold += item.quantity;
    curr.revenue += item.quantity * item.unitPrice;
    curr.orderIds.add(item.orderId);
    statsMap.set(item.productId, curr);
  }

  // Pre-calculate products
  const preCalculated = SEED_DATA.products.map((p, idx) => {
    const stats = statsMap.get(p.id) ?? {
      unitsSold: 0,
      revenue: 0,
      orderIds: new Set<string>(),
    };

    // Deterministic stock states ensuring all 3 states are represented
    let stock = p.stock;
    let stockStatus: StockStatus = "In Stock";

    if (idx % 25 === 0) {
      stock = 0;
      stockStatus = "Out of Stock";
    } else if (idx % 8 === 0) {
      stock = Math.min(22, Math.max(4, (p.stock % 20) + 3));
      stockStatus = "Low Stock";
    }

    const revenue = Math.round(stats.revenue * 100) / 100;
    const grossProfit =
      Math.round((revenue - stats.unitsSold * p.cost) * 100) / 100;
    const grossMargin =
      revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0;

    return {
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      categoryName: categoryMap.get(p.categoryId) ?? "Uncategorized",
      price: p.price,
      cost: p.cost,
      stock,
      stockStatus,
      unitsSold: stats.unitsSold,
      revenue,
      grossProfit,
      grossMargin,
      ordersCount: stats.orderIds.size,
      createdAt: p.createdAt,
    };
  });

  // Assign performance tier based on revenue ranking
  const sortedByRevenue = [...preCalculated].sort(
    (a, b) => b.revenue - a.revenue
  );
  const totalCount = sortedByRevenue.length;
  const performanceMap = new Map<string, ProductPerformance>();

  sortedByRevenue.forEach((p, rank) => {
    let tier: ProductPerformance;
    const percentile = rank / totalCount;
    if (percentile <= 0.15) {
      tier = "Top Performer";
    } else if (percentile <= 0.50) {
      tier = "Strong";
    } else if (percentile <= 0.85) {
      tier = "Average";
    } else {
      tier = "Underperforming";
    }
    performanceMap.set(p.id, tier);
  });

  cachedProductRows = preCalculated.map((p) => ({
    ...p,
    performance: performanceMap.get(p.id) ?? "Average",
  }));

  return cachedProductRows;
}

/**
 * Returns complete product details including sales trend and recent orders.
 */
export function getProductDetailById(id: string): ProductDetailViewData | null {
  if (!id || typeof id !== "string") {
    return null;
  }

  const normalizedId = id.trim().toLowerCase();
  if (cachedDetailMap.has(normalizedId)) {
    return cachedDetailMap.get(normalizedId)!;
  }

  const allProducts = getProductTableRows();
  const product = allProducts.find((p) => p.id.toLowerCase() === normalizedId);
  if (!product) {
    return null;
  }

  const orderMap = new Map(SEED_DATA.orders.map((o) => [o.id, o]));
  const customerMap = new Map(SEED_DATA.customers.map((c) => [c.id, c]));

  // Filter items matching this product
  const matchingItems = SEED_DATA.orderItems.filter(
    (item) => item.productId.toLowerCase() === normalizedId
  );

  // 1. Build chronological monthly sales trend points
  const monthlyTrendMap = new Map<string, { revenue: number; units: number }>();

  for (const item of matchingItems) {
    const order = orderMap.get(item.orderId);
    if (!order || order.status === "Cancelled") continue;

    const monthKey = order.createdAt.substring(0, 7); // YYYY-MM
    const curr = monthlyTrendMap.get(monthKey) ?? { revenue: 0, units: 0 };
    curr.revenue += item.quantity * item.unitPrice;
    curr.units += item.quantity;
    monthlyTrendMap.set(monthKey, curr);
  }

  const sortedMonths = Array.from(monthlyTrendMap.keys()).sort();
  const salesTrend: ProductSalesTrendPoint[] = sortedMonths.map((key) => {
    const data = monthlyTrendMap.get(key)!;
    const [year, month] = key.split("-");
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const label = dateObj.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

    return {
      date: key,
      label,
      revenue: Math.round(data.revenue * 100) / 100,
      units: data.units,
    };
  });

  // 2. Build Recent Orders
  const recentOrders: ProductRecentOrder[] = [];
  for (const item of matchingItems) {
    const order = orderMap.get(item.orderId);
    if (!order) continue;
    const customer = customerMap.get(order.customerId);

    recentOrders.push({
      orderId: order.id,
      customerId: order.customerId,
      customerName: customer?.name ?? "Unknown Customer",
      customerEmail: customer?.email ?? "unknown@example.com",
      date: order.createdAt,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: Math.round(item.quantity * item.unitPrice * 100) / 100,
      status: order.status,
    });
  }

  // Sort recent orders newest first
  recentOrders.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const averageOrderQuantity =
    product.ordersCount > 0
      ? Math.round((product.unitsSold / product.ordersCount) * 10) / 10
      : 0;

  const detail: ProductDetailViewData = {
    id: product.id,
    name: product.name,
    categoryId: product.categoryId,
    categoryName: product.categoryName,
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    stockStatus: product.stockStatus,
    createdAt: product.createdAt,
    totalRevenue: product.revenue,
    unitsSold: product.unitsSold,
    grossProfit: product.grossProfit,
    grossMargin: product.grossMargin,
    ordersCount: product.ordersCount,
    averageOrderQuantity,
    performance: product.performance,
    salesTrend,
    recentOrders: recentOrders.slice(0, 15),
  };

  cachedDetailMap.set(normalizedId, detail);
  return detail;
}
