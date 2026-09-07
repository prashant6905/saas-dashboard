import type { CustomerSegment, OrderStatus, Region } from "./ecommerce";

export interface CustomerTableRow {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  region: Region;
  segment: CustomerSegment;
  ordersCount: number;
  totalSpend: number;
  averageOrderValue: number;
  lastPurchaseDate: string | null;
  firstPurchaseDate: string | null;
  createdAt: string;
}

export interface CustomerPurchaseTrendPoint {
  date: string; // YYYY-MM
  label: string; // e.g. "Sep 25"
  spend: number;
  ordersCount: number;
}

export interface CustomerRecentOrder {
  orderId: string;
  date: string;
  region: Region;
  totalAmount: number;
  status: OrderStatus;
  itemsCount: number;
  itemsSummary: string;
}

export interface CustomerDetailViewData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  region: Region;
  segment: CustomerSegment;
  createdAt: string;
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  deliveredOrders: number;
  cancelledOrders: number;
  lastPurchaseDate: string | null;
  firstPurchaseDate: string | null;
  purchaseHistory: CustomerPurchaseTrendPoint[];
  recentOrders: CustomerRecentOrder[];
}

export interface CustomerSummaryKPIs {
  totalCustomers: number;
  averageLifetimeValue: number;
  repeatCustomerRatio: number; // percentage of Returning + VIP
  atRiskCount: number;
}

export interface CustomersTableFilters {
  search: string;
  region: Region | "all";
  segment: CustomerSegment | "all";
  sortBy: "name" | "ordersCount" | "totalSpend" | "averageOrderValue" | "lastPurchaseDate";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}
