import type {
  CustomerSegment,
  OrderStatus,
  PaymentMethod,
  Region,
} from "./ecommerce";

export interface EnrichedOrderItem {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  unitCost: number;
  lineCost: number;
  lineProfit: number;
  stock: number;
}

export interface TimelineStep {
  status: OrderStatus;
  label: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  timestamp?: string;
}

export interface EnrichedOrderDetail {
  id: string;
  status: OrderStatus;
  createdAt: string;
  region: Region;
  totalAmount: number;
  totalCost: number;
  grossProfit: number;
  grossMargin: number;
  paymentMethod?: PaymentMethod;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    region: Region;
    segment: CustomerSegment;
    createdAt: string;
    totalOrdersCount: number;
    totalSpend: number;
  };
  items: EnrichedOrderItem[];
  timeline: TimelineStep[];
}
