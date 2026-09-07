import { z } from "zod";

export const RegionSchema = z.enum([
  "Maharashtra",
  "Karnataka",
  "Delhi",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Kerala",
]);

export const CustomerSegmentSchema = z.enum([
  "New",
  "Returning",
  "VIP",
  "At Risk",
]);

export const OrderStatusSchema = z.enum([
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
]);

export const UserRoleSchema = z.enum(["ADMIN", "VIEWER"]);

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: UserRoleSchema,
  avatarUrl: z.string().url().optional(),
});

export const CustomerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  region: RegionSchema,
  segment: CustomerSegmentSchema,
  createdAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
});

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const ProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  categoryId: z.string().min(1),
  price: z.number().positive(),
  cost: z.number().positive(),
  stock: z.number().int().nonnegative(),
  createdAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
}).refine((data) => data.cost <= data.price, {
  message: "Product cost cannot exceed price",
  path: ["cost"],
});

export const OrderItemSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

export const OrderSchema = z.object({
  id: z.string().min(1),
  customerId: z.string().min(1),
  status: OrderStatusSchema,
  totalAmount: z.number().positive(),
  region: RegionSchema,
  createdAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T/)),
});

export type UserInput = z.infer<typeof UserSchema>;
export type CustomerInput = z.infer<typeof CustomerSchema>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
export type OrderItemInput = z.infer<typeof OrderItemSchema>;
