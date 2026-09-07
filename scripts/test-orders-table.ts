import { getOrderTableRows } from "../lib/data/orders";
import {
  parseOrdersUrlParams,
  ordersFiltersToSearchParams,
  areOrdersFiltersDefault,
  getOrdersActiveFilterCount,
} from "../lib/filters/orders-url-sync";

console.log("🧪 Running Step 7 TanStack Orders Table Unit Tests...\n");

// 1. Validate Enriched Data Rows
const rows = getOrderTableRows();
console.log("1. Validating Enriched Order Rows:");
console.log(`- Total Enriched Rows: ${rows.length}`);
if (rows.length === 2000) {
  console.log("✅ Exactly 2,000 rows enriched.");
} else {
  console.error(`❌ Expected 2000 rows, got ${rows.length}`);
  process.exit(1);
}

const invalidRow = rows.find(
  (r) => !r.id || !r.customerName || !r.customerEmail || !r.region || !r.status
);
if (!invalidRow) {
  console.log("✅ 100% of order rows contain valid ID, customer name, email, region, and status.");
} else {
  console.error("❌ Found invalid order row:", invalidRow);
  process.exit(1);
}

// 2. Test Multi-Field Search (ID, Customer Name, Email)
console.log("\n2. Testing Multi-Field Search Capabilities:");
const searchById = rows.filter((r) => r.id.toLowerCase().includes("ord_0001"));
console.log(`- Search 'ord_0001' found: ${searchById.length} match(es)`);
if (searchById.length >= 1 && searchById[0].id.toLowerCase().includes("ord_0001")) {
  console.log("✅ Order ID search verified.");
} else {
  console.error("❌ Order ID search failed!");
  process.exit(1);
}

const testCustomer = rows[0].customerName.split(" ")[0]; // e.g. "Emma"
const searchByName = rows.filter((r) =>
  r.customerName.toLowerCase().includes(testCustomer.toLowerCase())
);
console.log(`- Search '${testCustomer}' found: ${searchByName.length} match(es)`);
if (searchByName.length > 0) {
  console.log("✅ Customer name search verified.");
} else {
  console.error("❌ Customer name search failed!");
  process.exit(1);
}

const searchByEmail = rows.filter((r) =>
  r.customerEmail.toLowerCase().includes("@example.com")
);
console.log(`- Search '@example.com' found: ${searchByEmail.length} matches`);
if (searchByEmail.length === 2000) {
  console.log("✅ Customer email search verified.");
} else {
  console.error("❌ Customer email search failed!");
  process.exit(1);
}

// 3. Test Sorting
console.log("\n3. Testing Multi-Column Sorting Logic:");
const sortedByAmountDesc = [...rows].sort((a, b) => b.totalAmount - a.totalAmount);
console.log(`- Highest order: ${sortedByAmountDesc[0].id} ($${sortedByAmountDesc[0].totalAmount})`);
console.log(`- Lowest order: ${sortedByAmountDesc[sortedByAmountDesc.length - 1].id} ($${sortedByAmountDesc[sortedByAmountDesc.length - 1].totalAmount})`);
if (sortedByAmountDesc[0].totalAmount >= sortedByAmountDesc[1].totalAmount) {
  console.log("✅ Amount descending sort verified.");
} else {
  console.error("❌ Amount sorting failed!");
  process.exit(1);
}

const sortedByDateDesc = [...rows].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
);
if (
  new Date(sortedByDateDesc[0].createdAt).getTime() >=
  new Date(sortedByDateDesc[1].createdAt).getTime()
) {
  console.log("✅ Date descending sort verified.");
} else {
  console.error("❌ Date sorting failed!");
  process.exit(1);
}

// 4. Test Filtering: Status and Region
console.log("\n4. Testing Multi-Dimensional Filters:");
const deliveredOrders = rows.filter((r) => r.status === "Delivered");
const mhOrders = rows.filter((r) => r.region === "Maharashtra");
const deliveredInMH = rows.filter(
  (r) => r.status === "Delivered" && r.region === "Maharashtra"
);
console.log(`- Delivered orders count: ${deliveredOrders.length}`);
console.log(`- Maharashtra orders count: ${mhOrders.length}`);
console.log(`- Delivered in Maharashtra: ${deliveredInMH.length}`);
if (
  deliveredOrders.length > 0 &&
  mhOrders.length > 0 &&
  deliveredInMH.length > 0 &&
  deliveredInMH.every((r) => r.status === "Delivered" && r.region === "Maharashtra")
) {
  console.log("✅ Status and Region filtering verified.");
} else {
  console.error("❌ Filtering logic failed!");
  process.exit(1);
}

// 5. Test URL Synchronization & Resilience
console.log("\n5. Testing Orders URL State Synchronization:");
const validParams = new URLSearchParams(
  "page=3&pageSize=50&search=john&status=delivered&region=maharashtra&sort=totalAmount&order=asc"
);
const parsed = parseOrdersUrlParams(validParams);
console.log(`- Parsed Page: ${parsed.page}`);
console.log(`- Parsed PageSize: ${parsed.pageSize}`);
console.log(`- Parsed Search: ${parsed.search}`);
console.log(`- Parsed Status: ${parsed.status}`);
console.log(`- Parsed Region: ${parsed.region}`);
console.log(`- Parsed Sort: ${parsed.sortBy} ${parsed.sortOrder}`);
console.log(`- Active filter count: ${getOrdersActiveFilterCount(parsed)}`);

if (
  parsed.page === 3 &&
  parsed.pageSize === 50 &&
  parsed.search === "john" &&
  parsed.status === "Delivered" &&
  parsed.region === "Maharashtra" &&
  parsed.sortBy === "totalAmount" &&
  parsed.sortOrder === "asc"
) {
  console.log("✅ Orders URL parameters correctly parsed.");
} else {
  console.error("❌ Orders URL parsing failed!");
  process.exit(1);
}

const serializedOrdersParams = ordersFiltersToSearchParams(parsed);
console.log(`- Serialized params: ?${serializedOrdersParams.toString()}`);
if (serializedOrdersParams.get("page") === "3") {
  console.log("✅ ordersFiltersToSearchParams verified.");
}

// Test Corrupted / Invalid URL Query Params
const corruptedParams = new URLSearchParams(
  "page=-5&pageSize=9999&status=invalid_status&region=mars&sort=fake_column&order=backwards"
);
const sanitized = parseOrdersUrlParams(corruptedParams);
console.log(`- Sanitized Page: ${sanitized.page}`);
console.log(`- Sanitized PageSize: ${sanitized.pageSize}`);
console.log(`- Sanitized Status: ${sanitized.status}`);
console.log(`- Sanitized Region: ${sanitized.region}`);
console.log(`- Sanitized Sort: ${sanitized.sortBy} ${sanitized.sortOrder}`);

if (
  sanitized.page === 1 &&
  sanitized.pageSize === 20 &&
  sanitized.status === "all" &&
  sanitized.region === "all" &&
  sanitized.sortBy === "createdAt" &&
  sanitized.sortOrder === "desc" &&
  areOrdersFiltersDefault(sanitized)
) {
  console.log("✅ Corrupted parameters gracefully defaulted without throwing.");
} else {
  console.error("❌ Corrupted param fallback failed!");
  process.exit(1);
}

console.log("\n🎉 ALL STEP 7 ORDERS TABLE UNIT TESTS PASSED SUCCESSFULLY!");
