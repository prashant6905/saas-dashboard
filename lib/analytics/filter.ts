import type { EcommerceDataset } from "@/types/ecommerce";
import type { AnalyticsFilter, FilteredDataset } from "./types";

/**
 * Normalizes input date to timestamp. Returns undefined if date is invalid or undefined.
 */
export function normalizeDate(date?: string | Date): number | undefined {
  if (!date) return undefined;
  const time = new Date(date).getTime();
  return isNaN(time) ? undefined : time;
}

/**
 * Pure function that applies multi-dimensional filters (date range, regions,
 * categories, statuses, customer segments) to an e-commerce dataset.
 *
 * Guarantees zero side effects and returns clean referential slices.
 */
export function filterDataset(
  data: EcommerceDataset,
  filter?: AnalyticsFilter
): FilteredDataset {
  if (!data || !data.orders || data.orders.length === 0) {
    return {
      orders: [],
      orderItems: [],
      customers: [],
      products: data?.products ?? [],
      categories: data?.categories ?? [],
    };
  }

  const startTime = normalizeDate(filter?.dateRange?.startDate);
  const endTime = normalizeDate(filter?.dateRange?.endDate);

  // If both dates provided and start > end, handle invalid interval safely
  if (startTime !== undefined && endTime !== undefined && startTime > endTime) {
    return {
      orders: [],
      orderItems: [],
      customers: [],
      products: data.products,
      categories: data.categories,
    };
  }

  // Pre-build index lookups for fast filtering
  const productMap = new Map(data.products.map((p) => [p.id, p]));
  const customerMap = new Map(data.customers.map((c) => [c.id, c]));

  // 1. Filter Orders by Date Range, Region, and Status
  let matchedOrders = data.orders.filter((order) => {
    const orderTime = new Date(order.createdAt).getTime();

    if (startTime !== undefined && orderTime < startTime) return false;
    if (endTime !== undefined && orderTime > endTime) return false;

    if (filter?.regions && filter.regions.length > 0) {
      if (!filter.regions.includes(order.region)) return false;
    }

    if (filter?.statuses && filter.statuses.length > 0) {
      if (!filter.statuses.includes(order.status)) return false;
    }

    if (filter?.segments && filter.segments.length > 0) {
      const cust = customerMap.get(order.customerId);
      if (!cust || !filter.segments.includes(cust.segment)) return false;
    }

    return true;
  });

  const matchedOrderIds = new Set(matchedOrders.map((o) => o.id));

  // 2. Filter OrderItems matching the selected orders and category filter
  let matchedItems = data.orderItems.filter((item) =>
    matchedOrderIds.has(item.orderId)
  );

  if (filter?.categories && filter.categories.length > 0) {
    const targetCategoryIds = new Set(filter.categories);
    matchedItems = matchedItems.filter((item) => {
      const prod = productMap.get(item.productId);
      return prod && targetCategoryIds.has(prod.categoryId);
    });

    // When category filter is active, only retain orders that contain items in that category
    const ordersWithMatchingItems = new Set(matchedItems.map((i) => i.orderId));
    matchedOrders = matchedOrders.filter((o) => ordersWithMatchingItems.has(o.id));
  }

  // 3. Collect active customers
  const activeCustomerIds = new Set(matchedOrders.map((o) => o.customerId));
  const matchedCustomers = data.customers.filter((c) =>
    activeCustomerIds.has(c.id)
  );

  return {
    orders: matchedOrders,
    orderItems: matchedItems,
    customers: matchedCustomers,
    products: data.products,
    categories: data.categories,
  };
}
