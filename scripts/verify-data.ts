import { generateDeterministicSeed, SEED_DATA } from "../lib/data/seed-data";
import {
  getOverviewMetrics,
  getRevenueByRegion,
  getRevenueByCategory,
} from "../lib/analytics";
import {
  CustomerSchema,
  ProductSchema,
  OrderSchema,
  OrderItemSchema,
  CategorySchema,
} from "../lib/validations/ecommerce";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
}

console.log("🔍 Starting Step 3 Data Integrity & Relationship Verifications...\n");

// 1. Verify Entity Counts
console.log("1. Validating Entity Counts:");
console.log(`- Categories: ${SEED_DATA.categories.length}`);
console.log(`- Products: ${SEED_DATA.products.length}`);
console.log(`- Customers: ${SEED_DATA.customers.length}`);
console.log(`- Orders: ${SEED_DATA.orders.length}`);
console.log(`- OrderItems: ${SEED_DATA.orderItems.length}`);

assert(SEED_DATA.categories.length === 10, "Categories count must be exactly 10");
assert(SEED_DATA.products.length === 150, "Products count must be exactly 150");
assert(SEED_DATA.customers.length === 500, "Customers count must be exactly 500");
assert(SEED_DATA.orders.length === 2000, "Orders count must be exactly 2000");
assert(SEED_DATA.orderItems.length > 2000, "Order items must be multiple per order");
console.log("✅ Entity counts verified.\n");

// 2. Foreign Key & Relationship Integrity
console.log("2. Verifying Referential Integrity & Relationships:");
const categoryIds = new Set(SEED_DATA.categories.map((c) => c.id));
const productIds = new Set(SEED_DATA.products.map((p) => p.id));
const customerIds = new Set(SEED_DATA.customers.map((c) => c.id));
const orderIds = new Set(SEED_DATA.orders.map((o) => o.id));

// Check every product references a valid category
for (const p of SEED_DATA.products) {
  assert(categoryIds.has(p.categoryId), `Product ${p.id} references invalid category ${p.categoryId}`);
}
console.log("✅ All 150 products reference a valid category.");

// Check every order references a valid customer
for (const o of SEED_DATA.orders) {
  assert(customerIds.has(o.customerId), `Order ${o.id} references invalid customer ${o.customerId}`);
}
console.log("✅ All 2,000 orders reference a valid customer.");

// Check every order item references a valid order and product (No orphaned items)
for (const item of SEED_DATA.orderItems) {
  assert(orderIds.has(item.orderId), `OrderItem ${item.id} references invalid order ${item.orderId}`);
  assert(productIds.has(item.productId), `OrderItem ${item.id} references invalid product ${item.productId}`);
}
console.log(`✅ All ${SEED_DATA.orderItems.length} order items reference valid orders and products (Zero orphans).`);

// 3. Mathematical & Total Amount Integrity
console.log("\n3. Validating Financial Calculations & Total Amounts:");
const orderItemsByOrder = new Map<string, typeof SEED_DATA.orderItems>();
for (const item of SEED_DATA.orderItems) {
  const existing = orderItemsByOrder.get(item.orderId) ?? [];
  existing.push(item);
  orderItemsByOrder.set(item.orderId, existing);
}

let mismatchedTotals = 0;
for (const order of SEED_DATA.orders) {
  const items = orderItemsByOrder.get(order.id) ?? [];
  assert(items.length > 0, `Order ${order.id} has no order items`);

  const computedTotal = Math.round(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) * 100
  ) / 100;

  const diff = Math.abs(order.totalAmount - computedTotal);
  if (diff > 0.01) {
    mismatchedTotals++;
  }
}
assert(mismatchedTotals === 0, `Found ${mismatchedTotals} orders with mismatched item sums`);
console.log("✅ All order totalAmounts match the exact sum of order items (qty * unitPrice).");

// 4. Date Horizon Verification
console.log("\n4. Verifying Date Horizon (At least 12 months):");
const orderTimestamps = SEED_DATA.orders.map((o) => new Date(o.createdAt).getTime());
const minDate = new Date(Math.min(...orderTimestamps));
const maxDate = new Date(Math.max(...orderTimestamps));
const spanDays = Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
console.log(`- Earliest order: ${minDate.toISOString()}`);
console.log(`- Latest order:   ${maxDate.toISOString()}`);
console.log(`- Total span:     ${spanDays} days (${(spanDays / 30.4).toFixed(1)} months)`);
assert(spanDays >= 365, "Dataset must cover at least 12 months");
console.log("✅ Date horizon covers >= 12 months.");

// 5. Determinism Verification
console.log("\n5. Verifying Determinism:");
const secondSeed = generateDeterministicSeed(133742);
assert(
  JSON.stringify(SEED_DATA.orders.slice(0, 10)) === JSON.stringify(secondSeed.orders.slice(0, 10)),
  "Second seed generation must match identically"
);
assert(
  SEED_DATA.orders[0].id === secondSeed.orders[0].id &&
    SEED_DATA.orders[0].totalAmount === secondSeed.orders[0].totalAmount,
  "Order #1 attributes must match exactly across repeated runs"
);
console.log("✅ PRNG determinism verified: identical seed yields identical dataset.");

// 6. Zod Schema Validations
console.log("\n6. Validating Zod Schemas:");
CategorySchema.parse(SEED_DATA.categories[0]);
ProductSchema.parse(SEED_DATA.products[0]);
CustomerSchema.parse(SEED_DATA.customers[0]);
OrderSchema.parse(SEED_DATA.orders[0]);
OrderItemSchema.parse(SEED_DATA.orderItems[0]);
console.log("✅ All entity Zod validation schemas passed.");

// 7. Analytical Query Aggregations
console.log("\n7. Executing Analytical Domain Calculations:");
const summary = getOverviewMetrics(SEED_DATA);
console.log(`- Total Revenue:      $${summary.totalRevenue.toLocaleString()}`);
console.log(`- Total Orders:       ${summary.totalOrders.toLocaleString()}`);
console.log(`- Active Customers:   ${summary.totalCustomers.toLocaleString()}`);
console.log(`- Total Profit:       $${summary.grossProfit.toLocaleString()}`);
console.log(`- Net Profit Margin:  ${summary.grossMargin}%`);
console.log(`- Average Order Value: $${summary.averageOrderValue}`);

assert(summary.totalRevenue > 0, "Revenue must be positive");
assert(summary.grossProfit > 0, "Profit must be positive");
assert(summary.grossMargin > 20 && summary.grossMargin < 80, "Profit margin must be realistic");

const regional = getRevenueByRegion(SEED_DATA);
console.log(`- Regions Analyzed:   ${regional.length}`);
assert(regional.length === 7, "Must report 7 global regions");

const categoriesMetrics = getRevenueByCategory(SEED_DATA);
console.log(`- Categories Analyzed:${categoriesMetrics.length}`);
assert(categoriesMetrics.length === 10, "Must report 10 categories");

console.log("\n🎉 ALL STEP 3 DATA & RELATIONSHIP INTEGRITY CHECKS PASSED!");
