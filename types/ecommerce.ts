export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type CustomerSegment = "New" | "Returning" | "VIP" | "At Risk";

export type Region =
  | "Maharashtra"
  | "Karnataka"
  | "Delhi"
  | "Tamil Nadu"
  | "Telangana"
  | "Gujarat"
  | "Uttar Pradesh"
  | "West Bengal"
  | "Rajasthan"
  | "Kerala";

export type PaymentMethod =
  | "UPI"
  | "Credit Card"
  | "Debit Card"
  | "Net Banking"
  | "Cash on Delivery"
  | "Wallet";

export type Role = "ADMIN" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  region: Region;
  segment: CustomerSegment;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  cost: number;
  stock: number;
  createdAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  status: OrderStatus;
  totalAmount: number;
  region: Region;
  paymentMethod?: PaymentMethod;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderWithDetails extends Order {
  customer?: Customer;
  items: (OrderItem & { product?: Product })[];
}

export interface EcommerceDataset {
  users: User[];
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  orderItems: OrderItem[];
}
