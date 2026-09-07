import type {
  Category,
  Customer,
  CustomerSegment,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  Region,
} from "@/types/ecommerce";

export interface AnalyticsFilter {
  dateRange?: {
    startDate?: string | Date;
    endDate?: string | Date;
  };
  regions?: Region[];
  categories?: string[];
  statuses?: OrderStatus[];
  segments?: CustomerSegment[];
}

export interface OverviewMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  totalProductsSold: number;
  grossProfit: number;
  grossMargin: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface MetricComparison {
  current: number;
  previous: number;
  absoluteChange: number;
  percentageChange: number | null;
}

export interface OverviewComparison {
  revenue: MetricComparison;
  orders: MetricComparison;
  customers: MetricComparison;
  averageOrderValue: MetricComparison;
  productsSold: MetricComparison;
  grossProfit: MetricComparison;
  grossMargin: MetricComparison;
}

export interface TimeSeriesPoint {
  date: string;
  revenue: number;
  ordersCount: number;
  unitsSold: number;
  grossProfit: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  revenue: number;
  ordersCount: number;
  unitsSold: number;
  percentageOfTotal: number;
}

export interface RegionBreakdown {
  region: Region;
  revenue: number;
  ordersCount: number;
  customersCount: number;
  percentageOfTotal: number;
}

export interface StatusBreakdown {
  status: OrderStatus;
  count: number;
  revenue: number;
  percentageOfTotal: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  categoryId: string;
  categoryName: string;
  price: number;
  cost: number;
  unitsSold: number;
  revenue: number;
  grossProfit: number;
  grossMargin: number;
}

export interface TopCustomer {
  customerId: string;
  name: string;
  email: string;
  region: Region;
  segment: CustomerSegment;
  totalSpend: number;
  ordersCount: number;
  averageOrderValue: number;
  firstOrderDate: string;
  lastOrderDate: string;
}

export interface CustomerCohortAnalysis {
  newCustomers: number;
  returningCustomers: number;
  totalActiveCustomers: number;
}

export interface SegmentBreakdown {
  segment: CustomerSegment;
  customerCount: number;
  percentageOfCustomers: number;
  totalSpend: number;
  percentageOfRevenue: number;
  averageSpend: number;
  ordersCount: number;
}

export interface FilteredDataset {
  orders: Order[];
  orderItems: OrderItem[];
  customers: Customer[];
  products: Product[];
  categories: Category[];
}
