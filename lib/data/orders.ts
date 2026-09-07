import { getFilterDateRange } from "@/lib/filters/date-ranges";
import type { DatePresetKey } from "@/lib/filters/types";
import { SEED_DATA } from "./seed-data";
import type { OrderTableRow } from "@/types/orders-table";
import type {
  EnrichedOrderDetail,
  EnrichedOrderItem,
  TimelineStep,
} from "@/types/order-details";

let cachedOrderRows: OrderTableRow[] | null = null;
const cachedDetailMap = new Map<string, EnrichedOrderDetail>();

/**
 * Returns all 2,000 deterministic orders enriched with customer details
 * and line-item counts. Cached for zero-overhead client querying.
 */
export function getOrderTableRows(): OrderTableRow[] {
  if (cachedOrderRows) {
    return cachedOrderRows;
  }

  const customerMap = new Map(SEED_DATA.customers.map((c) => [c.id, c]));
  const productMap = new Map(SEED_DATA.products.map((p) => [p.id, p]));
  const categoryMap = new Map(SEED_DATA.categories.map((c) => [c.id, c]));

  // Precompute item counts and categories per order
  const itemCountMap = new Map<string, number>();
  const orderCategoriesMap = new Map<string, { ids: Set<string>; names: Set<string> }>();

  for (const item of SEED_DATA.orderItems) {
    const prev = itemCountMap.get(item.orderId) ?? 0;
    itemCountMap.set(item.orderId, prev + item.quantity);

    const product = productMap.get(item.productId);
    if (product) {
      let catEntry = orderCategoriesMap.get(item.orderId);
      if (!catEntry) {
        catEntry = { ids: new Set(), names: new Set() };
        orderCategoriesMap.set(item.orderId, catEntry);
      }
      catEntry.ids.add(product.categoryId);
      const cat = categoryMap.get(product.categoryId);
      if (cat) catEntry.names.add(cat.name);
    }
  }

  cachedOrderRows = SEED_DATA.orders.map((order) => {
    const customer = customerMap.get(order.customerId);
    const catEntry = orderCategoriesMap.get(order.id);

    return {
      id: order.id,
      customerId: order.customerId,
      customerName: customer?.name ?? "Unknown Customer",
      customerEmail: customer?.email ?? "unknown@example.com",
      customerPhone: customer?.phone,
      customerCity: customer?.city,
      customerSegment: customer?.segment ?? "New",
      createdAt: order.createdAt,
      region: order.region,
      totalAmount: order.totalAmount,
      status: order.status,
      itemCount: itemCountMap.get(order.id) ?? 1,
      paymentMethod: order.paymentMethod,
      categoryIds: catEntry ? Array.from(catEntry.ids) : [],
      categoryNames: catEntry ? Array.from(catEntry.names) : [],
    };
  });

  return cachedOrderRows;
}

/**
 * Retrieves complete enriched order details for a specific order ID.
 * Returns null if the order does not exist or ID is invalid.
 */
export function getOrderDetailById(id: string): EnrichedOrderDetail | null {
  if (!id || typeof id !== "string") {
    return null;
  }

  const normalizedId = id.trim().toLowerCase();
  if (cachedDetailMap.has(normalizedId)) {
    return cachedDetailMap.get(normalizedId)!;
  }

  const order = SEED_DATA.orders.find(
    (o) => o.id.toLowerCase() === normalizedId
  );
  if (!order) {
    return null;
  }

  const customer = SEED_DATA.customers.find((c) => c.id === order.customerId);
  const customerOrders = SEED_DATA.orders.filter(
    (o) => o.customerId === order.customerId
  );
  const totalOrdersCount = customerOrders.length;
  const totalSpend =
    Math.round(
      customerOrders.reduce((sum, o) => sum + o.totalAmount, 0) * 100
    ) / 100;

  // Build line items
  const productMap = new Map(SEED_DATA.products.map((p) => [p.id, p]));
  const categoryMap = new Map(SEED_DATA.categories.map((c) => [c.id, c]));

  const rawItems = SEED_DATA.orderItems.filter(
    (item) => item.orderId === order.id
  );

  const items: EnrichedOrderItem[] = rawItems.map((item) => {
    const product = productMap.get(item.productId);
    const category = product ? categoryMap.get(product.categoryId) : undefined;
    const quantity = item.quantity;
    const unitPrice = item.unitPrice;
    const lineTotal = Math.round(quantity * unitPrice * 100) / 100;
    const unitCost = product?.cost ?? Math.round(unitPrice * 0.45 * 100) / 100;
    const lineCost = Math.round(quantity * unitCost * 100) / 100;
    const lineProfit = Math.round((lineTotal - lineCost) * 100) / 100;

    return {
      id: item.id,
      productId: item.productId,
      productName: product?.name ?? "Unknown Product",
      categoryName: category?.name ?? "General",
      quantity,
      unitPrice,
      lineTotal,
      unitCost,
      lineCost,
      lineProfit,
      stock: product?.stock ?? 0,
    };
  });

  const subtotal =
    Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
  const totalCost =
    Math.round(items.reduce((sum, item) => sum + item.lineCost, 0) * 100) / 100;
  const grossProfit = Math.round((subtotal - totalCost) * 100) / 100;
  const grossMargin =
    subtotal > 0 ? Math.round((grossProfit / subtotal) * 10000) / 100 : 0;

  // Timeline representation based on actual status
  let timeline: TimelineStep[];

  if (order.status === "Cancelled") {
    timeline = [
      {
        status: "Pending",
        label: "Order Placed",
        description: "Transaction initialized by customer",
        isCompleted: true,
        isCurrent: false,
        timestamp: order.createdAt,
      },
      {
        status: "Cancelled",
        label: "Cancelled",
        description: "Order fulfillment cancelled before completion",
        isCompleted: true,
        isCurrent: true,
      },
    ];
  } else {
    timeline = [
      {
        status: "Pending",
        label: "Order Placed",
        description: "Transaction initialized and authorized",
        isCompleted: true,
        isCurrent: order.status === "Pending",
        timestamp: order.createdAt,
      },
      {
        status: "Processing",
        label: "Processing",
        description: "Payment captured, items queued for fulfillment",
        isCompleted: ["Processing", "Shipped", "Delivered"].includes(order.status),
        isCurrent: order.status === "Processing",
      },
      {
        status: "Shipped",
        label: "Shipped",
        description: "Consigned to regional logistics courier",
        isCompleted: ["Shipped", "Delivered"].includes(order.status),
        isCurrent: order.status === "Shipped",
      },
      {
        status: "Delivered",
        label: "Delivered",
        description: "Delivered to customer destination",
        isCompleted: order.status === "Delivered",
        isCurrent: order.status === "Delivered",
      },
    ];
  }

  const detail: EnrichedOrderDetail = {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    region: order.region,
    totalAmount: order.totalAmount,
    totalCost,
    grossProfit,
    grossMargin,
    paymentMethod: order.paymentMethod,
    customer: {
      id: customer?.id ?? order.customerId,
      name: customer?.name ?? "Unknown Customer",
      email: customer?.email ?? "unknown@example.com",
      phone: customer?.phone,
      city: customer?.city,
      region: customer?.region ?? order.region,
      segment: customer?.segment ?? "New",
      createdAt: customer?.createdAt ?? order.createdAt,
      totalOrdersCount,
      totalSpend,
    },
    items,
    timeline,
  };

  cachedDetailMap.set(normalizedId, detail);
  return detail;
}

export interface OrderFilterCriteria {
  search?: string;
  status?: string;
  region?: string;
  category?: string;
  range?: string;
}

const VALID_DATE_PRESETS = new Set<string>([
  "today",
  "7d",
  "30d",
  "90d",
  "12m",
  "custom",
]);

/**
 * Centralized order filtering logic used across orders table and CSV exports.
 */
export function filterOrderTableRows(
  rows: OrderTableRow[],
  filters: OrderFilterCriteria
): OrderTableRow[] {
  let result = rows;

  // 1. Search Filter (ID, customer name, customer email)
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (row) =>
        row.id.toLowerCase().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        row.customerEmail.toLowerCase().includes(q)
    );
  }

  // 2. Status Filter
  if (filters.status && filters.status !== "all") {
    const s = filters.status.toLowerCase();
    result = result.filter((row) => row.status.toLowerCase() === s);
  }

  // 3. Region Filter
  if (filters.region && filters.region !== "all") {
    const r = filters.region.toLowerCase().replace(/[-_]/g, " ");
    result = result.filter((row) => row.region.toLowerCase() === r);
  }

  // 4. Category Filter
  if (filters.category && filters.category !== "all") {
    const cat = filters.category.toLowerCase();
    result = result.filter(
      (row) =>
        row.categoryIds?.some((id) => id.toLowerCase() === cat) ||
        row.categoryNames?.some((name) => name.toLowerCase() === cat)
    );
  }

  // 5. Date Range Filter
  if (
    filters.range &&
    filters.range !== "all" &&
    VALID_DATE_PRESETS.has(filters.range)
  ) {
    try {
      const rangeBounds = getFilterDateRange(filters.range as DatePresetKey);
      const start = new Date(rangeBounds.startDate).getTime();
      const end = new Date(rangeBounds.endDate).getTime();
      result = result.filter((row) => {
        const time = new Date(row.createdAt).getTime();
        return time >= start && time <= end;
      });
    } catch {
      // ignore invalid preset
    }
  }

  return result;
}
