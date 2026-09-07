import type { CustomerSegment, OrderStatus, PaymentMethod, Region } from "@/types/ecommerce";
import type { DatePresetKey } from "@/lib/filters/types";

export interface OrderTableRow {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerCity?: string;
  customerSegment: CustomerSegment;
  createdAt: string;
  region: Region;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
  paymentMethod?: PaymentMethod;
  categoryIds?: string[];
  categoryNames?: string[];
}

export interface OrdersTableFilters {
  search: string;
  status: OrderStatus | "all";
  region: Region | "all";
  category: string | "all";
  range: DatePresetKey | "all";
  page: number;
  pageSize: number;
  sortBy: "createdAt" | "totalAmount" | "customerName" | "status";
  sortOrder: "asc" | "desc";
}

export const DEFAULT_ORDERS_FILTERS: OrdersTableFilters = {
  search: "",
  status: "all",
  region: "all",
  category: "all",
  range: "all",
  page: 1,
  pageSize: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};
