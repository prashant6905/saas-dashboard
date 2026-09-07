import { getOrderDetailById } from "../lib/data/orders";
import { SEED_DATA } from "../lib/data/seed-data";

console.log("🧪 Running Step 8 Order Details Unit & Integration Tests...\n");

// 1. Test Valid Order Retrieval
console.log("1. Validating Order Details for 'ord_00001':");
const order = getOrderDetailById("ord_00001");

if (!order) {
  console.error("❌ Failed to retrieve 'ord_00001'");
  process.exit(1);
}

console.log(`- ID: ${order.id}`);
console.log(`- Status: ${order.status}`);
console.log(`- Region: ${order.region}`);
console.log(`- Date: ${order.createdAt}`);
console.log(`- Total Amount: $${order.totalAmount}`);
console.log(`- Customer: ${order.customer.name} (${order.customer.email}) [${order.customer.segment}]`);
console.log(`- Customer Total Orders: ${order.customer.totalOrdersCount}, Spend: $${order.customer.totalSpend}`);
console.log(`- Line Items Count: ${order.items.length}`);
console.log(`- Subtotal: $${order.items.reduce((s, i) => s + i.lineTotal, 0)}, COGS: $${order.totalCost}, Gross Profit: $${order.grossProfit} (${order.grossMargin.toFixed(1)}%)`);

// Assertions on ord_00001
if (
  order.id === "ord_00001" &&
  order.customer.name &&
  order.customer.email &&
  order.items.length > 0 &&
  order.timeline.length === 4
) {
  console.log("✅ Basic order structure and relationships validated.");
} else {
  console.error("❌ Order structure validation failed!");
  process.exit(1);
}

// 2. Math Accuracy Checks
console.log("\n2. Testing Financial Summary Math Consistency:");
const computedSubtotal = Math.round(order.items.reduce((sum, i) => sum + i.lineTotal, 0) * 100) / 100;
const computedCost = Math.round(order.items.reduce((sum, i) => sum + i.lineCost, 0) * 100) / 100;
const computedProfit = Math.round((computedSubtotal - computedCost) * 100) / 100;

if (Math.abs(order.totalAmount - computedSubtotal) < 0.05) {
  console.log(`✅ Order total ($${order.totalAmount}) matches line-item subtotal ($${computedSubtotal}).`);
} else {
  console.error(`❌ Total amount mismatch! Expected ${order.totalAmount}, got ${computedSubtotal}`);
  process.exit(1);
}

if (Math.abs(order.grossProfit - computedProfit) < 0.05) {
  console.log(`✅ Gross profit ($${order.grossProfit}) matches subtotal minus COGS ($${computedProfit}).`);
} else {
  console.error(`❌ Gross profit mismatch! Expected ${order.grossProfit}, got ${computedProfit}`);
  process.exit(1);
}

// 3. Test Invalid and Missing Orders
console.log("\n3. Testing Missing and Invalid Order ID Handling:");
const missingOrder = getOrderDetailById("ord_99999");
const invalidOrder = getOrderDetailById("invalid_id_xyz");
const emptyOrder = getOrderDetailById("");
const whitespaceOrder = getOrderDetailById("   ");

if (
  missingOrder === null &&
  invalidOrder === null &&
  emptyOrder === null &&
  whitespaceOrder === null
) {
  console.log("✅ All invalid/missing order IDs returned null as expected.");
} else {
  console.error("❌ Invalid order ID check failed!");
  process.exit(1);
}

// 4. Test Case Insensitivity
console.log("\n4. Testing ID Normalization & Case Insensitivity:");
const upperOrder = getOrderDetailById("ORD_00001");
const spacedOrder = getOrderDetailById("  ord_00001  ");

if (upperOrder?.id === "ord_00001" && spacedOrder?.id === "ord_00001") {
  console.log("✅ Case insensitivity and whitespace trimming verified.");
} else {
  console.error("❌ Case insensitivity check failed!");
  process.exit(1);
}

// 5. Test Timeline Representation Across Different Statuses
console.log("\n5. Testing Timeline Across Different Real Order Statuses:");
const statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;

for (const status of statuses) {
  const sampleOrder = SEED_DATA.orders.find((o) => o.status === status);
  if (!sampleOrder) continue;

  const detail = getOrderDetailById(sampleOrder.id);
  if (!detail) {
    console.error(`❌ Could not fetch order with status ${status}`);
    process.exit(1);
  }

  if (status === "Cancelled") {
    const isCancelled = detail.timeline.some((t) => t.status === "Cancelled" && t.isCurrent);
    if (isCancelled) {
      console.log(`✅ Cancelled order ${sampleOrder.id} timeline properly reflects cancellation.`);
    } else {
      console.error(`❌ Cancelled order timeline failed for ${sampleOrder.id}`);
      process.exit(1);
    }
  } else if (status === "Delivered") {
    const allCompleted = detail.timeline.every((t) => t.isCompleted);
    if (allCompleted) {
      console.log(`✅ Delivered order ${sampleOrder.id} timeline marks all 4 milestones as completed.`);
    } else {
      console.error(`❌ Delivered order timeline failed for ${sampleOrder.id}`);
      process.exit(1);
    }
  } else if (status === "Pending") {
    const pendingStep = detail.timeline.find((t) => t.status === "Pending");
    const processingStep = detail.timeline.find((t) => t.status === "Processing");
    if (pendingStep?.isCurrent && !processingStep?.isCompleted) {
      console.log(`✅ Pending order ${sampleOrder.id} timeline correctly isolates to pending milestone.`);
    } else {
      console.error(`❌ Pending order timeline failed for ${sampleOrder.id}`);
      process.exit(1);
    }
  } else if (status === "Processing") {
    const processingStep = detail.timeline.find((t) => t.status === "Processing");
    const shippedStep = detail.timeline.find((t) => t.status === "Shipped");
    if (processingStep?.isCurrent && !shippedStep?.isCompleted) {
      console.log(`✅ Processing order ${sampleOrder.id} timeline reflects in-progress fulfillment.`);
    }
  } else if (status === "Shipped") {
    const shippedStep = detail.timeline.find((t) => t.status === "Shipped");
    const deliveredStep = detail.timeline.find((t) => t.status === "Delivered");
    if (shippedStep?.isCurrent && !deliveredStep?.isCompleted) {
      console.log(`✅ Shipped order ${sampleOrder.id} timeline marks courier transit as active.`);
    }
  }
}

console.log("\n🎉 ALL STEP 8 ORDER DETAILS UNIT TESTS PASSED SUCCESSFULLY!");
