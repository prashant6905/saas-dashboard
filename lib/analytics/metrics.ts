import type {
  CustomerSegment,
  EcommerceDataset,
  OrderStatus,
  Region,
} from "@/types/ecommerce";
import { filterDataset } from "./filter";
import type {
  AnalyticsFilter,
  CategoryBreakdown,
  CustomerCohortAnalysis,
  OverviewMetrics,
  RegionBreakdown,
  SegmentBreakdown,
  StatusBreakdown,
  TimeSeriesPoint,
  TopCustomer,
  TopProduct,
} from "./types";

/**
 * 1. Calculate Total Revenue
 */
export function getTotalRevenue(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): number {
  const { orders, orderItems } = filterDataset(data, filter);
  if (orders.length === 0 || orderItems.length === 0) return 0;

  const validOrderIds = new Set(
    orders.filter((o) => o.status !== "Cancelled").map((o) => o.id)
  );

  let total = 0;
  for (const item of orderItems) {
    if (validOrderIds.has(item.orderId)) {
      total += item.quantity * item.unitPrice;
    }
  }

  return Math.round(total * 100) / 100;
}

/**
 * 2. Calculate Total Orders Count
 */
export function getTotalOrders(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): number {
  const { orders } = filterDataset(data, filter);
  return orders.length;
}

/**
 * 3. Calculate Total Customers
 * If order-specific filters (dateRange, categories, statuses) are active,
 * returns active purchasing customers within that slice.
 * Otherwise, returns total customers matching demographic filters (regions, segments).
 */
export function getTotalCustomers(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): number {
  if (!data || !data.customers) return 0;

  const hasOrderSpecificFilter =
    Boolean(filter?.dateRange?.startDate || filter?.dateRange?.endDate) ||
    Boolean(filter?.categories && filter.categories.length > 0) ||
    Boolean(filter?.statuses && filter.statuses.length > 0);

  if (hasOrderSpecificFilter) {
    const { customers } = filterDataset(data, filter);
    return customers.length;
  }

  let result = data.customers;
  if (filter?.regions && filter.regions.length > 0) {
    result = result.filter((c) => filter.regions!.includes(c.region));
  }
  if (filter?.segments && filter.segments.length > 0) {
    result = result.filter((c) => filter.segments!.includes(c.segment));
  }

  return result.length;
}

/**
 * 4. Calculate Average Order Value (AOV)
 */
export function getAverageOrderValue(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): number {
  const { orders, orderItems } = filterDataset(data, filter);
  const validOrders = orders.filter((o) => o.status !== "Cancelled");
  if (validOrders.length === 0) return 0;

  const validOrderIds = new Set(validOrders.map((o) => o.id));
  let totalRevenue = 0;
  for (const item of orderItems) {
    if (validOrderIds.has(item.orderId)) {
      totalRevenue += item.quantity * item.unitPrice;
    }
  }

  return Math.round((totalRevenue / validOrders.length) * 100) / 100;
}

/**
 * 5. Calculate Total Products / Units Sold
 */
export function getTotalProductsSold(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): number {
  const { orders, orderItems } = filterDataset(data, filter);
  if (orders.length === 0 || orderItems.length === 0) return 0;

  const validOrderIds = new Set(
    orders.filter((o) => o.status !== "Cancelled").map((o) => o.id)
  );

  let units = 0;
  for (const item of orderItems) {
    if (validOrderIds.has(item.orderId)) {
      units += item.quantity;
    }
  }

  return units;
}

/**
 * 6. Calculate Gross Profit
 */
export function getGrossProfit(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): number {
  const { orders, orderItems, products } = filterDataset(data, filter);
  if (orders.length === 0 || orderItems.length === 0) return 0;

  const validOrderIds = new Set(
    orders.filter((o) => o.status !== "Cancelled").map((o) => o.id)
  );
  const productMap = new Map(products.map((p) => [p.id, p]));

  let profit = 0;
  for (const item of orderItems) {
    if (validOrderIds.has(item.orderId)) {
      const prod = productMap.get(item.productId);
      const cost = prod ? prod.cost : 0;
      profit += item.quantity * (item.unitPrice - cost);
    }
  }

  return Math.round(profit * 100) / 100;
}

/**
 * 7. Calculate Gross Margin Percentage
 */
export function getGrossMargin(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): number {
  const revenue = getTotalRevenue(data, filter);
  if (revenue <= 0) return 0;

  const profit = getGrossProfit(data, filter);
  return Math.round((profit / revenue) * 10000) / 100;
}

/**
 * Helper to compute Overview KPIs in a single optimized pass
 */
export function getOverviewMetrics(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): OverviewMetrics {
  const filtered = filterDataset(data, filter);
  const { orders, orderItems, products } = filtered;

  if (orders.length === 0) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      averageOrderValue: 0,
      totalProductsSold: 0,
      grossProfit: 0,
      grossMargin: 0,
      newCustomers: 0,
      returningCustomers: 0,
    };
  }

  const validOrders = orders.filter((o) => o.status !== "Cancelled");
  const validOrderIds = new Set(validOrders.map((o) => o.id));
  const productMap = new Map(products.map((p) => [p.id, p]));

  let totalRevenue = 0;
  let totalCost = 0;
  let totalProductsSold = 0;

  for (const item of orderItems) {
    if (validOrderIds.has(item.orderId)) {
      const revenue = item.quantity * item.unitPrice;
      const prod = productMap.get(item.productId);
      const cost = prod ? prod.cost * item.quantity : 0;

      totalRevenue += revenue;
      totalCost += cost;
      totalProductsSold += item.quantity;
    }
  }

  totalRevenue = Math.round(totalRevenue * 100) / 100;
  const grossProfit = Math.round((totalRevenue - totalCost) * 100) / 100;
  const grossMargin =
    totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 10000) / 100 : 0;
  const averageOrderValue =
    validOrders.length > 0
      ? Math.round((totalRevenue / validOrders.length) * 100) / 100
      : 0;

  const cohorts = getCustomerCohortAnalysis(data, filter);

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers: getTotalCustomers(data, filter),
    averageOrderValue,
    totalProductsSold,
    grossProfit,
    grossMargin,
    newCustomers: cohorts.newCustomers,
    returningCustomers: cohorts.returningCustomers,
  };
}

/**
 * 8. Calculate Revenue by Day (YYYY-MM-DD)
 */
export function getRevenueByDay(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): TimeSeriesPoint[] {
  const { orders, orderItems, products } = filterDataset(data, filter);
  if (orders.length === 0) return [];

  const productMap = new Map(products.map((p) => [p.id, p]));
  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const pointsMap = new Map<
    string,
    { revenue: number; orders: Set<string>; units: number; cost: number }
  >();

  for (const item of orderItems) {
    const order = orderMap.get(item.orderId);
    if (!order || order.status === "Cancelled") continue;

    const dayKey = order.createdAt.substring(0, 10);
    let entry = pointsMap.get(dayKey);
    if (!entry) {
      entry = { revenue: 0, orders: new Set(), units: 0, cost: 0 };
      pointsMap.set(dayKey, entry);
    }

    const prod = productMap.get(item.productId);
    const itemCost = prod ? prod.cost * item.quantity : 0;

    entry.revenue += item.quantity * item.unitPrice;
    entry.units += item.quantity;
    entry.cost += itemCost;
    entry.orders.add(order.id);
  }

  return Array.from(pointsMap.entries())
    .map(([date, val]) => {
      const revenue = Math.round(val.revenue * 100) / 100;
      const profit = Math.round((revenue - val.cost) * 100) / 100;
      return {
        date,
        revenue,
        ordersCount: val.orders.size,
        unitsSold: val.units,
        grossProfit: profit,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 9. Calculate Revenue by Month (YYYY-MM)
 */
export function getRevenueByMonth(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): TimeSeriesPoint[] {
  const { orders, orderItems, products } = filterDataset(data, filter);
  if (orders.length === 0) return [];

  const productMap = new Map(products.map((p) => [p.id, p]));
  const orderMap = new Map(orders.map((o) => [o.id, o]));
  const pointsMap = new Map<
    string,
    { revenue: number; orders: Set<string>; units: number; cost: number }
  >();

  for (const item of orderItems) {
    const order = orderMap.get(item.orderId);
    if (!order || order.status === "Cancelled") continue;

    const monthKey = order.createdAt.substring(0, 7);
    let entry = pointsMap.get(monthKey);
    if (!entry) {
      entry = { revenue: 0, orders: new Set(), units: 0, cost: 0 };
      pointsMap.set(monthKey, entry);
    }

    const prod = productMap.get(item.productId);
    const itemCost = prod ? prod.cost * item.quantity : 0;

    entry.revenue += item.quantity * item.unitPrice;
    entry.units += item.quantity;
    entry.cost += itemCost;
    entry.orders.add(order.id);
  }

  return Array.from(pointsMap.entries())
    .map(([date, val]) => {
      const revenue = Math.round(val.revenue * 100) / 100;
      const profit = Math.round((revenue - val.cost) * 100) / 100;
      return {
        date,
        revenue,
        ordersCount: val.orders.size,
        unitsSold: val.units,
        grossProfit: profit,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 10. Calculate Revenue by Category
 */
export function getRevenueByCategory(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): CategoryBreakdown[] {
  const { orders, orderItems, products, categories } = filterDataset(data, filter);
  if (categories.length === 0) return [];

  const validOrderIds = new Set(
    orders.filter((o) => o.status !== "Cancelled").map((o) => o.id)
  );
  const productMap = new Map(products.map((p) => [p.id, p]));

  const catMap = new Map<
    string,
    { revenue: number; orders: Set<string>; units: number }
  >();
  for (const cat of categories) {
    catMap.set(cat.id, { revenue: 0, orders: new Set(), units: 0 });
  }

  let totalOverallRevenue = 0;

  for (const item of orderItems) {
    if (!validOrderIds.has(item.orderId)) continue;
    const prod = productMap.get(item.productId);
    if (!prod) continue;

    const catStats = catMap.get(prod.categoryId);
    if (catStats) {
      const itemRev = item.quantity * item.unitPrice;
      catStats.revenue += itemRev;
      catStats.units += item.quantity;
      catStats.orders.add(item.orderId);
      totalOverallRevenue += itemRev;
    }
  }

  return categories
    .map((cat) => {
      const stats = catMap.get(cat.id) ?? { revenue: 0, orders: new Set(), units: 0 };
      const revenue = Math.round(stats.revenue * 100) / 100;
      const percentageOfTotal =
        totalOverallRevenue > 0
          ? Math.round((revenue / totalOverallRevenue) * 10000) / 100
          : 0;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        revenue,
        ordersCount: stats.orders.size,
        unitsSold: stats.units,
        percentageOfTotal,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * 11. Calculate Revenue by Region
 */
export function getRevenueByRegion(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): RegionBreakdown[] {
  const { orders, orderItems } = filterDataset(data, filter);
  if (orders.length === 0) return [];

  const orderItemsByOrder = new Map<string, number>();

  for (const item of orderItems) {
    const prev = orderItemsByOrder.get(item.orderId) ?? 0;
    orderItemsByOrder.set(item.orderId, prev + item.quantity * item.unitPrice);
  }

  const regionMap = new Map<
    string,
    { revenue: number; ordersCount: number; customers: Set<string> }
  >();

  let totalRevenue = 0;

  for (const order of orders) {
    let entry = regionMap.get(order.region);
    if (!entry) {
      entry = { revenue: 0, ordersCount: 0, customers: new Set() };
      regionMap.set(order.region, entry);
    }

    entry.ordersCount++;
    entry.customers.add(order.customerId);

    if (order.status !== "Cancelled") {
      const orderRev = orderItemsByOrder.get(order.id) ?? order.totalAmount;
      entry.revenue += orderRev;
      totalRevenue += orderRev;
    }
  }

  return Array.from(regionMap.entries())
    .map(([region, val]) => {
      const revenue = Math.round(val.revenue * 100) / 100;
      const percentageOfTotal =
        totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 10000) / 100 : 0;

      return {
        region: region as Region,
        revenue,
        ordersCount: val.ordersCount,
        customersCount: val.customers.size,
        percentageOfTotal,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * 12. Calculate Orders by Status
 */
export function getOrdersByStatus(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): StatusBreakdown[] {
  const { orders } = filterDataset(data, filter);
  if (orders.length === 0) return [];

  const statusMap = new Map<string, { count: number; revenue: number }>();
  const allStatuses: OrderStatus[] = [
    "Delivered",
    "Shipped",
    "Processing",
    "Pending",
    "Cancelled",
  ];

  for (const s of allStatuses) {
    statusMap.set(s, { count: 0, revenue: 0 });
  }

  let totalOrders = 0;

  for (const o of orders) {
    const entry = statusMap.get(o.status) ?? { count: 0, revenue: 0 };
    entry.count++;
    entry.revenue += o.totalAmount;
    statusMap.set(o.status, entry);
    totalOrders++;
  }

  return allStatuses.map((status) => {
    const val = statusMap.get(status) ?? { count: 0, revenue: 0 };
    const percentageOfTotal =
      totalOrders > 0 ? Math.round((val.count / totalOrders) * 10000) / 100 : 0;

    return {
      status,
      count: val.count,
      revenue: Math.round(val.revenue * 100) / 100,
      percentageOfTotal,
    };
  });
}

/**
 * 13. Calculate Top Products Ranked by Revenue
 */
export function getTopProducts(
  data: EcommerceDataset,
  filter?: AnalyticsFilter,
  limit: number = 10
): TopProduct[] {
  const { orders, orderItems, products, categories } = filterDataset(data, filter);
  if (products.length === 0 || orderItems.length === 0) return [];

  const validOrderIds = new Set(
    orders.filter((o) => o.status !== "Cancelled").map((o) => o.id)
  );
  const productMap = new Map(products.map((p) => [p.id, p]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const statsMap = new Map<string, { unitsSold: number; revenue: number }>();

  for (const item of orderItems) {
    if (!validOrderIds.has(item.orderId)) continue;
    const curr = statsMap.get(item.productId) ?? { unitsSold: 0, revenue: 0 };
    curr.unitsSold += item.quantity;
    curr.revenue += item.quantity * item.unitPrice;
    statsMap.set(item.productId, curr);
  }

  return Array.from(statsMap.entries())
    .map(([productId, stats]) => {
      const prod = productMap.get(productId);
      const name = prod ? prod.name : "Unknown Product";
      const categoryId = prod ? prod.categoryId : "";
      const categoryName = categoryMap.get(categoryId) ?? "Uncategorized";
      const price = prod ? prod.price : 0;
      const cost = prod ? prod.cost : 0;

      const revenue = Math.round(stats.revenue * 100) / 100;
      const grossProfit = Math.round((revenue - stats.unitsSold * cost) * 100) / 100;
      const grossMargin =
        revenue > 0 ? Math.round((grossProfit / revenue) * 10000) / 100 : 0;

      return {
        productId,
        name,
        categoryId,
        categoryName,
        price,
        cost,
        unitsSold: stats.unitsSold,
        revenue,
        grossProfit,
        grossMargin,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

/**
 * 14. Calculate Top Customers Ranked by Lifetime/Window Spend
 */
export function getTopCustomers(
  data: EcommerceDataset,
  filter?: AnalyticsFilter,
  limit: number = 10
): TopCustomer[] {
  const { orders, customers } = filterDataset(data, filter);
  if (customers.length === 0 || orders.length === 0) return [];

  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const statsMap = new Map<
    string,
    { spend: number; ordersCount: number; dates: string[] }
  >();

  for (const order of orders) {
    if (order.status === "Cancelled") continue;

    let stats = statsMap.get(order.customerId);
    if (!stats) {
      stats = { spend: 0, ordersCount: 0, dates: [] };
      statsMap.set(order.customerId, stats);
    }

    stats.spend += order.totalAmount;
    stats.ordersCount++;
    stats.dates.push(order.createdAt);
  }

  return Array.from(statsMap.entries())
    .map(([customerId, stats]) => {
      const cust = customerMap.get(customerId);
      const totalSpend = Math.round(stats.spend * 100) / 100;
      const aov =
        stats.ordersCount > 0
          ? Math.round((totalSpend / stats.ordersCount) * 100) / 100
          : 0;

      stats.dates.sort();
      const firstOrderDate = stats.dates[0] ?? "";
      const lastOrderDate = stats.dates[stats.dates.length - 1] ?? "";

      return {
        customerId,
        name: cust ? cust.name : "Unknown",
        email: cust ? cust.email : "unknown@example.com",
        region: cust ? cust.region : ("Maharashtra" as Region),
        segment: cust ? cust.segment : ("New" as CustomerSegment),
        totalSpend,
        ordersCount: stats.ordersCount,
        averageOrderValue: aov,
        firstOrderDate,
        lastOrderDate,
      };
    })
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, limit);
}

/**
 * 15 & 16. Calculate Customer Cohort Analysis (New vs Returning Customers)
 */
export function getCustomerCohortAnalysis(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): CustomerCohortAnalysis {
  if (!data || data.orders.length === 0) {
    return { newCustomers: 0, returningCustomers: 0, totalActiveCustomers: 0 };
  }

  // Pre-calculate each customer's first-ever order date in the entire dataset
  const firstOrderDates = new Map<string, number>();
  for (const order of data.orders) {
    const time = new Date(order.createdAt).getTime();
    const existing = firstOrderDates.get(order.customerId);
    if (existing === undefined || time < existing) {
      firstOrderDates.set(order.customerId, time);
    }
  }

  const { orders } = filterDataset(data, filter);
  if (orders.length === 0) {
    return { newCustomers: 0, returningCustomers: 0, totalActiveCustomers: 0 };
  }

  const windowStartTime = filter?.dateRange?.startDate
    ? new Date(filter.dateRange.startDate).getTime()
    : undefined;

  const activeCustomerIds = new Set(
    orders.filter((o) => o.status !== "Cancelled").map((o) => o.customerId)
  );

  let newCustomers = 0;
  let returningCustomers = 0;

  for (const custId of activeCustomerIds) {
    const firstOrderTime = firstOrderDates.get(custId);
    if (windowStartTime !== undefined && firstOrderTime !== undefined) {
      if (firstOrderTime >= windowStartTime) {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    } else {
      // If no start date filter, look at customer segment directly
      const customer = data.customers.find((c) => c.id === custId);
      if (customer?.segment === "New") {
        newCustomers++;
      } else {
        returningCustomers++;
      }
    }
  }

  return {
    newCustomers,
    returningCustomers,
    totalActiveCustomers: activeCustomerIds.size,
  };
}

/**
 * 17. Calculate Customer Segment Distribution & Revenue Contribution
 */
export function getCustomerSegmentBreakdown(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): SegmentBreakdown[] {
  const allSegments: CustomerSegment[] = ["VIP", "Returning", "New", "At Risk"];
  if (!data || !data.customers || data.customers.length === 0) {
    return allSegments.map((segment) => ({
      segment,
      customerCount: 0,
      percentageOfCustomers: 0,
      totalSpend: 0,
      percentageOfRevenue: 0,
      averageSpend: 0,
      ordersCount: 0,
    }));
  }

  const hasOrderSpecificFilter =
    Boolean(filter?.dateRange?.startDate || filter?.dateRange?.endDate) ||
    Boolean(filter?.categories && filter.categories.length > 0) ||
    Boolean(filter?.statuses && filter.statuses.length > 0);

  let targetCustomers = data.customers;
  if (hasOrderSpecificFilter) {
    targetCustomers = filterDataset(data, filter).customers;
  } else {
    if (filter?.regions && filter.regions.length > 0) {
      targetCustomers = targetCustomers.filter((c) => filter.regions!.includes(c.region));
    }
    if (filter?.segments && filter.segments.length > 0) {
      targetCustomers = targetCustomers.filter((c) => filter.segments!.includes(c.segment));
    }
  }

  const { orders } = filterDataset(data, filter);

  if (targetCustomers.length === 0) {
    return allSegments.map((segment) => ({
      segment,
      customerCount: 0,
      percentageOfCustomers: 0,
      totalSpend: 0,
      percentageOfRevenue: 0,
      averageSpend: 0,
      ordersCount: 0,
    }));
  }

  // Pre-index valid non-cancelled orders by customerId
  const validOrders = orders.filter((o) => o.status !== "Cancelled");
  const ordersByCustomer = new Map<string, typeof validOrders>();
  for (const o of validOrders) {
    let list = ordersByCustomer.get(o.customerId);
    if (!list) {
      list = [];
      ordersByCustomer.set(o.customerId, list);
    }
    list.push(o);
  }

  const segmentStats = new Map<
    CustomerSegment,
    { customerCount: number; totalSpend: number; ordersCount: number }
  >();
  for (const s of allSegments) {
    segmentStats.set(s, { customerCount: 0, totalSpend: 0, ordersCount: 0 });
  }

  const totalOverallCustomers = targetCustomers.length;
  let totalOverallRevenue = 0;

  for (const customer of targetCustomers) {
    const entry = segmentStats.get(customer.segment) ?? {
      customerCount: 0,
      totalSpend: 0,
      ordersCount: 0,
    };
    entry.customerCount++;

    const custOrders = ordersByCustomer.get(customer.id) ?? [];
    entry.ordersCount += custOrders.length;
    const custSpend = custOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    entry.totalSpend += custSpend;
    totalOverallRevenue += custSpend;

    segmentStats.set(customer.segment, entry);
  }

  return allSegments.map((segment) => {
    const stats = segmentStats.get(segment) ?? {
      customerCount: 0,
      totalSpend: 0,
      ordersCount: 0,
    };

    const customerCount = stats.customerCount;
    const totalSpend = Math.round(stats.totalSpend * 100) / 100;
    const percentageOfCustomers =
      totalOverallCustomers > 0
        ? Math.round((customerCount / totalOverallCustomers) * 10000) / 100
        : 0;
    const percentageOfRevenue =
      totalOverallRevenue > 0
        ? Math.round((totalSpend / totalOverallRevenue) * 10000) / 100
        : 0;
    const averageSpend =
      customerCount > 0
        ? Math.round((totalSpend / customerCount) * 100) / 100
        : 0;

    return {
      segment,
      customerCount,
      percentageOfCustomers,
      totalSpend,
      percentageOfRevenue,
      averageSpend,
      ordersCount: stats.ordersCount,
    };
  });
}

