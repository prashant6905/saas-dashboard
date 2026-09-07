export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type ProductPerformance =
  | "Top Performer"
  | "Strong"
  | "Average"
  | "Underperforming";

export interface ProductTableRow {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost: number;
  stock: number;
  stockStatus: StockStatus;
  unitsSold: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
  ordersCount: number;
  performance: ProductPerformance;
  createdAt: string;
}

export interface ProductSalesTrendPoint {
  date: string; // YYYY-MM
  label: string; // e.g. "Sep 25"
  revenue: number;
  units: number;
}

export interface ProductRecentOrder {
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  date: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status: string;
}

export interface ProductDetailViewData {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost: number;
  stock: number;
  stockStatus: StockStatus;
  createdAt: string;
  totalRevenue: number;
  unitsSold: number;
  grossProfit: number;
  grossMargin: number;
  ordersCount: number;
  averageOrderQuantity: number;
  performance: ProductPerformance;
  salesTrend: ProductSalesTrendPoint[];
  recentOrders: ProductRecentOrder[];
}

export interface ProductsTableFilters {
  search: string;
  category: string | "all";
  stockStatus: StockStatus | "all";
  performance: ProductPerformance | "all";
  sortBy: "name" | "price" | "unitsSold" | "revenue" | "grossProfit" | "stock";
  sortOrder: "asc" | "desc";
  page: number;
  pageSize: number;
}
