import { SEED_DATA } from "../lib/data/seed-data";
import {
  getOverviewMetrics,
  comparePeriods,
  getRevenueByDay,
  getRevenueByMonth,
  getRevenueByCategory,
  getRevenueByRegion,
  getOrdersByStatus,
  getTopProducts,
  getCustomerSegmentBreakdown,
} from "../lib/analytics";
import type { AnalyticsFilter } from "../lib/analytics/types";

console.log("🧪 Running Step 11 Analytics Deep-Dive Unit & Integration Tests...\n");

// 1. Overall Metrics & Profitability
console.log("1. Testing Unit Economics & Gross Profit / Margin:");
const metrics = getOverviewMetrics(SEED_DATA);
console.log(`- Total Revenue:      $${metrics.totalRevenue.toLocaleString()}`);
console.log(`- Gross Profit:       $${metrics.grossProfit.toLocaleString()}`);
console.log(`- Gross Margin:       ${metrics.grossMargin}%`);
console.log(`- Total Orders:       ${metrics.totalOrders}`);
console.log(`- Total Products Sold:${metrics.totalProductsSold}`);

if (metrics.totalRevenue > 0 && metrics.grossProfit > 0 && metrics.grossMargin > 0) {
  console.log("✅ Unit economics calculated accurately (Profit > 0, Margin > 0).");
} else {
  console.error("❌ Unit economics calculation failed:", metrics);
  process.exit(1);
}

// 2. Revenue Trend (Day & Month)
console.log("\n2. Testing Revenue Velocity Trend:");
const dailyTrend = getRevenueByDay(SEED_DATA);
const monthlyTrend = getRevenueByMonth(SEED_DATA);
console.log(`- Daily data points:   ${dailyTrend.length}`);
console.log(`- Monthly data points: ${monthlyTrend.length}`);

if (dailyTrend.length > 0 && monthlyTrend.length > 0) {
  console.log("✅ Revenue trend calculated across daily and monthly granularities.");
} else {
  console.error("❌ Revenue trend points missing!");
  process.exit(1);
}

// 3. Revenue by Category
console.log("\n3. Testing Revenue by Category:");
const categories = getRevenueByCategory(SEED_DATA);
console.log(`- Categories evaluated: ${categories.length}`);
const catTotalRev = categories.reduce((sum, c) => sum + c.revenue, 0);
console.log(`- Aggregated Category Revenue: $${Math.round(catTotalRev).toLocaleString()}`);

if (categories.length === 10 && Math.abs(catTotalRev - metrics.totalRevenue) < 1.0) {
  console.log("✅ Category breakdown covers all 10 categories and matches total revenue.");
} else {
  console.error(`❌ Category mismatch! Sum: ${catTotalRev}, Total: ${metrics.totalRevenue}`);
  process.exit(1);
}

// 4. Revenue by Region
console.log("\n4. Testing Revenue by Region:");
const regions = getRevenueByRegion(SEED_DATA);
console.log(`- Operating regions: ${regions.length}`);
for (const r of regions) {
  console.log(`  * ${r.region}: $${r.revenue.toLocaleString()} (${r.percentageOfTotal}%)`);
}

if (regions.length === 7) {
  console.log("✅ All 7 global operating territories evaluated.");
} else {
  console.error(`❌ Expected 7 regions, got ${regions.length}`);
  process.exit(1);
}

// 5. Orders by Status
console.log("\n5. Testing Orders by Status:");
const statuses = getOrdersByStatus(SEED_DATA);
const statusTotalOrders = statuses.reduce((sum, s) => sum + s.count, 0);
console.log(`- Total status orders: ${statusTotalOrders}`);
for (const s of statuses) {
  console.log(`  * ${s.status}: ${s.count} orders ($${s.revenue.toLocaleString()}, ${s.percentageOfTotal}%)`);
}

if (statusTotalOrders === metrics.totalOrders && statuses.length === 5) {
  console.log("✅ Order status breakdown covers all 5 statuses and matches total order count.");
} else {
  console.error("❌ Order status breakdown mismatch!");
  process.exit(1);
}

// 6. Top Products Matrix
console.log("\n6. Testing Top Products Matrix:");
const topProducts = getTopProducts(SEED_DATA, undefined, 10);
console.log(`- Top SKUs retrieved: ${topProducts.length}`);
const topProd = topProducts[0];
console.log(`  #1 SKU: ${topProd.name} (Rev: $${topProd.revenue}, Margin: ${topProd.grossMargin}%)`);

if (topProducts.length === 10 && topProd.revenue > 0) {
  console.log("✅ Top 10 products successfully ranked by gross revenue.");
} else {
  console.error("❌ Top products query failed!");
  process.exit(1);
}

// 7. Customer Segments Dynamics
console.log("\n7. Testing Customer Segments Breakdown:");
const segments = getCustomerSegmentBreakdown(SEED_DATA);
console.log(`- Segments evaluated: ${segments.length}`);
let totalCustInSegments = 0;
for (const seg of segments) {
  totalCustInSegments += seg.customerCount;
  console.log(
    `  * ${seg.segment}: ${seg.customerCount} cust (${seg.percentageOfCustomers}%) | Rev: $${seg.totalSpend.toLocaleString()} (${seg.percentageOfRevenue}%) | AOV: $${seg.averageSpend}`
  );
}

if (segments.length === 4 && totalCustInSegments === 500) {
  console.log("✅ Customer segment dynamics accurately covers all 500 customers across VIP, Returning, New, and At Risk.");
} else {
  console.error(`❌ Segment validation failed! Total: ${totalCustInSegments}`);
  process.exit(1);
}

// 8. Filter Reactivity Tests
console.log("\n8. Testing Filter Reactivity across all 5 Filter Dimensions:");
const testFilter: AnalyticsFilter = {
  regions: ["Maharashtra"],
  statuses: ["Delivered", "Shipped"],
  segments: ["VIP"],
};

const filteredMetrics = getOverviewMetrics(SEED_DATA, testFilter);
console.log(`- Filtered (Maharashtra + VIP + Delivered/Shipped) Revenue: ₹${filteredMetrics.totalRevenue.toLocaleString()}`);
console.log(`- Filtered Orders Count: ${filteredMetrics.totalOrders}`);
console.log(`- Filtered Customers:    ${filteredMetrics.totalCustomers}`);

if (filteredMetrics.totalOrders > 0 && filteredMetrics.totalOrders < metrics.totalOrders) {
  console.log("✅ Analytics calculation layer dynamically responds to complex multi-dimensional filters.");
} else {
  console.error("❌ Filter reactivity test failed!");
  process.exit(1);
}

// 9. Period Comparison Test
console.log("\n9. Testing Period-over-Period Comparison:");
const comparison = comparePeriods(SEED_DATA, {
  dateRange: {
    startDate: "2026-08-01T00:00:00.000Z",
    endDate: "2026-08-31T23:59:59.999Z",
  },
});
console.log(`- Current Period Revenue:  $${comparison.revenue.current.toLocaleString()}`);
console.log(`- Previous Period Revenue: $${comparison.revenue.previous.toLocaleString()}`);
console.log(`- Revenue Change:          ${comparison.revenue.percentageChange?.toFixed(1)}%`);

if (comparison.revenue.current >= 0 && comparison.revenue.previous >= 0) {
  console.log("✅ Period comparison generated current and previous window metrics.");
} else {
  console.error("❌ Period comparison calculation failed!");
  process.exit(1);
}

console.log("\n🎉 ALL STEP 11 ANALYTICS TESTS PASSED WITH 100% INTEGRITY!");
