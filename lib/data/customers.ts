import { SEED_DATA } from "./seed-data";
import type {
  CustomerDetailViewData,
  CustomerPurchaseTrendPoint,
  CustomerRecentOrder,
  CustomerSummaryKPIs,
  CustomerTableRow,
} from "@/types/customers-table";

let cachedCustomerRows: CustomerTableRow[] | null = null;
const cachedCustomerDetailMap = new Map<string, CustomerDetailViewData>();
let cachedCustomerKPIs: CustomerSummaryKPIs | null = null;

/**
 * Returns all customers enriched with order velocity, total lifetime spend,
 * average order value (AOV), and latest purchase timestamps.
 */
export function getCustomerTableRows(): CustomerTableRow[] {
  if (cachedCustomerRows) {
    return cachedCustomerRows;
  }

  // Group orders by customerId
  const ordersByCustomer = new Map<string, typeof SEED_DATA.orders>();
  for (const order of SEED_DATA.orders) {
    let list = ordersByCustomer.get(order.customerId);
    if (!list) {
      list = [];
      ordersByCustomer.set(order.customerId, list);
    }
    list.push(order);
  }

  cachedCustomerRows = SEED_DATA.customers.map((c) => {
    const customerOrders = ordersByCustomer.get(c.id) ?? [];
    
    // Sort chronological: oldest to newest
    const sortedOrders = [...customerOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const validOrders = sortedOrders.filter((o) => o.status !== "Cancelled");
    const totalSpend = Math.round(
      validOrders.reduce((sum, o) => sum + o.totalAmount, 0) * 100
    ) / 100;

    const ordersCount = customerOrders.length;
    const averageOrderValue =
      validOrders.length > 0
        ? Math.round((totalSpend / validOrders.length) * 100) / 100
        : 0;

    const firstPurchaseDate =
      sortedOrders.length > 0 ? sortedOrders[0].createdAt : null;
    const lastPurchaseDate =
      sortedOrders.length > 0
        ? sortedOrders[sortedOrders.length - 1].createdAt
        : null;

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      city: c.city,
      region: c.region,
      segment: c.segment,
      ordersCount,
      totalSpend,
      averageOrderValue,
      lastPurchaseDate,
      firstPurchaseDate,
      createdAt: c.createdAt,
    };
  });

  return cachedCustomerRows;
}

/**
 * Returns high-level summary KPIs for the Customers directory.
 */
export function getCustomerSummaryKPIs(): CustomerSummaryKPIs {
  if (cachedCustomerKPIs) {
    return cachedCustomerKPIs;
  }

  const rows = getCustomerTableRows();
  const totalCustomers = rows.length;

  const totalSpendAll = rows.reduce((sum, r) => sum + r.totalSpend, 0);
  const averageLifetimeValue =
    totalCustomers > 0 ? Math.round((totalSpendAll / totalCustomers) * 100) / 100 : 0;

  const repeatCustomers = rows.filter(
    (r) => r.ordersCount > 1 || r.segment === "Returning" || r.segment === "VIP"
  ).length;
  const repeatCustomerRatio =
    totalCustomers > 0
      ? Math.round((repeatCustomers / totalCustomers) * 1000) / 10
      : 0;

  const atRiskCount = rows.filter((r) => r.segment === "At Risk").length;

  cachedCustomerKPIs = {
    totalCustomers,
    averageLifetimeValue,
    repeatCustomerRatio,
    atRiskCount,
  };

  return cachedCustomerKPIs;
}

/**
 * Returns complete customer profile, lifetime value metrics, purchase trajectory,
 * and order history for /customers/[id].
 */
export function getCustomerDetailById(id: string): CustomerDetailViewData | null {
  if (!id || typeof id !== "string") {
    return null;
  }

  const normalizedId = id.trim().toLowerCase();
  if (cachedCustomerDetailMap.has(normalizedId)) {
    return cachedCustomerDetailMap.get(normalizedId)!;
  }

  const allCustomers = getCustomerTableRows();
  const customer = allCustomers.find(
    (c) => c.id.toLowerCase() === normalizedId
  );

  if (!customer) {
    return null;
  }

  // Find all orders for this customer
  const customerOrders = SEED_DATA.orders.filter(
    (o) => o.customerId.toLowerCase() === normalizedId
  );

  // Group order items by order ID for quick lookup
  const productMap = new Map(SEED_DATA.products.map((p) => [p.id, p.name]));
  const itemsByOrder = new Map<string, typeof SEED_DATA.orderItems>();
  for (const item of SEED_DATA.orderItems) {
    let list = itemsByOrder.get(item.orderId);
    if (!list) {
      list = [];
      itemsByOrder.set(item.orderId, list);
    }
    list.push(item);
  }

  // 1. Build chronological monthly purchase history
  const monthlySpendMap = new Map<string, { spend: number; orders: number }>();
  for (const order of customerOrders) {
    if (order.status === "Cancelled") continue;

    const monthKey = order.createdAt.substring(0, 7); // YYYY-MM
    const curr = monthlySpendMap.get(monthKey) ?? { spend: 0, orders: 0 };
    curr.spend += order.totalAmount;
    curr.orders += 1;
    monthlySpendMap.set(monthKey, curr);
  }

  const sortedMonths = Array.from(monthlySpendMap.keys()).sort();
  const purchaseHistory: CustomerPurchaseTrendPoint[] = sortedMonths.map((key) => {
    const data = monthlySpendMap.get(key)!;
    const [year, month] = key.split("-");
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
    const label = dateObj.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

    return {
      date: key,
      label,
      spend: Math.round(data.spend * 100) / 100,
      ordersCount: data.orders,
    };
  });

  // 2. Build Recent Orders with items summaries
  const sortedOrdersNewest = [...customerOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const recentOrders: CustomerRecentOrder[] = sortedOrdersNewest.map((order) => {
    const items = itemsByOrder.get(order.id) ?? [];
    const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

    // Create readable summary: "Product A, Product B (+1 more)"
    let itemsSummary = "No items";
    if (items.length > 0) {
      const firstProductName =
        productMap.get(items[0].productId) ?? "Product";
      if (items.length === 1) {
        itemsSummary = `${firstProductName} (x${items[0].quantity})`;
      } else {
        itemsSummary = `${firstProductName} + ${items.length - 1} other${
          items.length > 2 ? "s" : ""
        }`;
      }
    }

    return {
      orderId: order.id,
      date: order.createdAt,
      region: order.region,
      totalAmount: order.totalAmount,
      status: order.status,
      itemsCount: totalItemsCount,
      itemsSummary,
    };
  });

  const deliveredOrders = customerOrders.filter((o) => o.status === "Delivered").length;
  const cancelledOrders = customerOrders.filter((o) => o.status === "Cancelled").length;

  const detailData: CustomerDetailViewData = {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    city: customer.city,
    region: customer.region,
    segment: customer.segment,
    createdAt: customer.createdAt,
    totalOrders: customer.ordersCount,
    totalSpend: customer.totalSpend,
    averageOrderValue: customer.averageOrderValue,
    deliveredOrders,
    cancelledOrders,
    lastPurchaseDate: customer.lastPurchaseDate,
    firstPurchaseDate: customer.firstPurchaseDate,
    purchaseHistory,
    recentOrders,
  };

  cachedCustomerDetailMap.set(normalizedId, detailData);
  return detailData;
}
