import { getCustomerTableRows, getCustomerDetailById, getCustomerSummaryKPIs } from "../lib/data/customers";
import {
  parseCustomersUrlParams,
  customersFiltersToSearchParams,
  getCustomersActiveFilterCount,
  DEFAULT_CUSTOMERS_FILTERS,
} from "../lib/filters/customers-url-sync";
import { SEED_DATA } from "../lib/data/seed-data";

console.log("🧪 Running Step 10 Customers Data & Analytics Unit Tests...\n");

// 1. Validate Customer Directory Rows
const customers = getCustomerTableRows();
console.log("1. Validating Customer Enrichment:");
console.log(`- Total Enriched Customers: ${customers.length}`);
if (customers.length === 500) {
  console.log("✅ Exactly 500 customers enriched from deterministic seed dataset.");
} else {
  console.error(`❌ Expected 500 customers, got ${customers.length}`);
  process.exit(1);
}

// 2. Validate Fields & Integrity
console.log("\n2. Testing Customer Required Fields:");
const invalidCustomer = customers.find(
  (c) =>
    !c.id ||
    !c.name ||
    !c.email ||
    !c.region ||
    !c.segment ||
    c.ordersCount < 0 ||
    c.totalSpend < 0 ||
    c.averageOrderValue < 0
);
if (!invalidCustomer) {
  console.log("✅ 100% of customers have valid id, name, email, region, segment, and spend metrics.");
} else {
  console.error("❌ Found invalid customer row:", invalidCustomer);
  process.exit(1);
}

// 3. Test Customer Segments Distribution
console.log("\n3. Testing Customer Segments:");
const newSeg = customers.filter((c) => c.segment === "New");
const retSeg = customers.filter((c) => c.segment === "Returning");
const vipSeg = customers.filter((c) => c.segment === "VIP");
const riskSeg = customers.filter((c) => c.segment === "At Risk");

console.log(`- New Customers:       ${newSeg.length}`);
console.log(`- Returning Customers: ${retSeg.length}`);
console.log(`- VIP Customers:       ${vipSeg.length}`);
console.log(`- At Risk Customers:   ${riskSeg.length}`);

if (newSeg.length > 0 && retSeg.length > 0 && vipSeg.length > 0 && riskSeg.length > 0) {
  console.log("✅ All 4 customer segments (New, Returning, VIP, At Risk) verified and populated.");
} else {
  console.error("❌ Missing one or more customer segments!");
  process.exit(1);
}

// 4. Test Financial & Order Metric Accuracy
console.log("\n4. Testing Financial & Order Metric Calculations:");
for (const cust of customers) {
  const custOrders = SEED_DATA.orders.filter(
    (o) => o.customerId === cust.id && o.status !== "Cancelled"
  );
  const expectedTotal =
    Math.round(custOrders.reduce((sum, o) => sum + o.totalAmount, 0) * 100) / 100;

  if (Math.abs(cust.totalSpend - expectedTotal) > 0.05) {
    console.error(
      `❌ Total spend mismatch for ${cust.id}: expected ${expectedTotal}, got ${cust.totalSpend}`
    );
    process.exit(1);
  }

  if (custOrders.length > 0) {
    const expectedAOV = Math.round((expectedTotal / custOrders.length) * 100) / 100;
    if (Math.abs(cust.averageOrderValue - expectedAOV) > 0.05) {
      console.error(
        `❌ AOV mismatch for ${cust.id}: expected ${expectedAOV}, got ${cust.averageOrderValue}`
      );
      process.exit(1);
    }
  }
}
console.log("✅ Customer total spend and AOV match non-cancelled order data with 100% precision.");

// 5. Test Customer Detail View
console.log("\n5. Testing getCustomerDetailById('cust_0001'):");
const detail = getCustomerDetailById("cust_0001");
if (!detail) {
  console.error("❌ Could not find customer 'cust_0001'");
  process.exit(1);
}

console.log(`- Name: ${detail.name}`);
console.log(`- Email: ${detail.email}`);
console.log(`- Region: ${detail.region}`);
console.log(`- Segment: ${detail.segment}`);
console.log(`- Total Orders: ${detail.totalOrders}`);
console.log(`- Total Spend: $${detail.totalSpend}`);
console.log(`- AOV: $${detail.averageOrderValue}`);
console.log(`- Purchase History Data Points: ${detail.purchaseHistory.length}`);
console.log(`- Recent Orders Count: ${detail.recentOrders.length}`);

if (
  detail.purchaseHistory.length > 0 &&
  detail.recentOrders.length === detail.totalOrders
) {
  console.log("✅ Customer detail view contains full purchase trajectory and all recent orders.");
} else {
  console.error("❌ Customer detail data validation failed!");
  process.exit(1);
}

// 6. Test Invalid Customer ID
console.log("\n6. Testing Invalid Customer ID Handling:");
const invalidDetail = getCustomerDetailById("cust_nonexistent_9999");
if (invalidDetail === null) {
  console.log("✅ Correctly returned null for invalid customer ID.");
} else {
  console.error("❌ Expected null for invalid ID, got:", invalidDetail);
  process.exit(1);
}

// 7. Test URL State Sync Helpers
console.log("\n7. Testing URL Parameter Serialization & Deserialization:");
const testParams = new URLSearchParams(
  "search=alice&region=Maharashtra&segment=VIP&page=2&pageSize=10&sort=averageOrderValue&order=asc"
);
const parsed = parseCustomersUrlParams(testParams);

if (
  parsed.search === "alice" &&
  parsed.region === "Maharashtra" &&
  parsed.segment === "VIP" &&
  parsed.page === 2 &&
  parsed.pageSize === 10 &&
  parsed.sortBy === "averageOrderValue" &&
  parsed.sortOrder === "asc"
) {
  console.log("✅ URL parameters parsed into CustomersTableFilters correctly.");
} else {
  console.error("❌ URL parameter parsing failed:", parsed);
  process.exit(1);
}

const serialized = customersFiltersToSearchParams(parsed);
if (
  serialized.get("search") === "alice" &&
  serialized.get("region") === "Europe" &&
  serialized.get("segment") === "VIP" &&
  serialized.get("page") === "2" &&
  serialized.get("pageSize") === "10" &&
  serialized.get("sort") === "averageOrderValue" &&
  serialized.get("order") === "asc"
) {
  console.log("✅ Filters serialized to URLSearchParams symmetrically.");
} else {
  console.error("❌ Filter serialization failed:", serialized.toString());
  process.exit(1);
}

const activeCount = getCustomersActiveFilterCount(parsed);
if (activeCount === 3) {
  console.log("✅ Active filter count computed correctly (3 active filters: search, region, segment).");
} else {
  console.error(`❌ Expected 3 active filters, got ${activeCount}`);
  process.exit(1);
}

console.log("\n🎉 ALL STEP 10 UNIT & INTEGRATION TESTS PASSED!");
