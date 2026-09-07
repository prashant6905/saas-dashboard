import { SEED_DATA } from "../lib/data/seed-data";
import {
  calculatePercentageChange,
  compareMetricValues,
  comparePeriods,
  getPreviousDateRange,
  getTotalRevenue,
  getTotalOrders,
  getTotalCustomers,
  getAverageOrderValue,
  getTotalProductsSold,
  getGrossProfit,
  getGrossMargin,
  getRevenueByDay,
  getRevenueByMonth,
  getRevenueByCategory,
  getRevenueByRegion,
  getOrdersByStatus,
  getTopProducts,
  getTopCustomers,
  getCustomerCohortAnalysis,
  getOverviewMetrics,
  filterDataset,
} from "../lib/analytics";
import type { EcommerceDataset } from "../types/ecommerce";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    process.exit(1);
  }
}

console.log("🧪 Running Step 4 Analytics Calculation Layer Unit Tests...\n");

// 1. Core Metric Calculations Tests
console.log("1. Testing Core Metric Calculations:");
const allRevenue = getTotalRevenue(SEED_DATA);
const allOrders = getTotalOrders(SEED_DATA);
const allCustomers = getTotalCustomers(SEED_DATA);
const aov = getAverageOrderValue(SEED_DATA);
const unitsSold = getTotalProductsSold(SEED_DATA);
const profit = getGrossProfit(SEED_DATA);
const margin = getGrossMargin(SEED_DATA);

console.log(`- Revenue:       $${allRevenue.toLocaleString()}`);
console.log(`- Orders:        ${allOrders}`);
console.log(`- Customers:     ${allCustomers}`);
console.log(`- AOV:           $${aov}`);
console.log(`- Units Sold:    ${unitsSold}`);
console.log(`- Gross Profit:  $${profit.toLocaleString()}`);
console.log(`- Gross Margin:  ${margin}%`);

assert(allRevenue > 1_000_000, "Total revenue should exceed $1M");
assert(allOrders === 2000, "Total orders must be exactly 2000");
assert(allCustomers === 500, "Total customers must be exactly 500");
assert(aov > 0 && aov < allRevenue, "AOV must be a positive realistic average");
assert(unitsSold >= 2000, "Units sold must be at least 1 per order");
assert(profit > 0 && profit < allRevenue, "Gross profit must be positive and less than revenue");
assert(margin > 40 && margin < 60, "Gross margin should be around ~50%");
console.log("✅ Core metric calculations passed.\n");

// 2. Percentage Change & Date Comparison Tests
console.log("2. Testing Percentage Change & Comparison Logic:");
assert(calculatePercentageChange(150, 100) === 50, "150 vs 100 should be +50%");
assert(calculatePercentageChange(80, 100) === -20, "80 vs 100 should be -20%");
assert(calculatePercentageChange(0, 0) === 0, "0 vs 0 should be 0%");
assert(calculatePercentageChange(100, 0) === null, "100 vs 0 baseline should return null");

const metricComp = compareMetricValues(1250, 1000);
assert(metricComp.absoluteChange === 250, "Absolute change should be 250");
assert(metricComp.percentageChange === 25, "Percentage change should be 25%");

const prevRange = getPreviousDateRange("2026-06-01T00:00:00Z", "2026-07-01T00:00:00Z");
assert(Boolean(prevRange.startDate && prevRange.endDate), "Previous range must be valid ISO strings");
const prevDuration = new Date(prevRange.endDate).getTime() - new Date(prevRange.startDate).getTime();
const currDuration = new Date("2026-07-01T00:00:00Z").getTime() - new Date("2026-06-01T00:00:00Z").getTime();
assert(prevDuration === currDuration, "Previous period duration must exactly match current period duration");

const periodComparison = comparePeriods(SEED_DATA, {
  dateRange: {
    startDate: "2026-05-01T00:00:00Z",
    endDate: "2026-06-01T00:00:00Z",
  },
});
assert(typeof periodComparison.revenue.current === "number", "Comparison current revenue must be number");
assert(typeof periodComparison.revenue.previous === "number", "Comparison previous revenue must be number");
console.log(`- Period Comparison Revenue: Current=$${periodComparison.revenue.current} vs Previous=$${periodComparison.revenue.previous} (${periodComparison.revenue.percentageChange}%)`);
console.log("✅ Percentage change & period comparison passed.\n");

// 3. Date Filtering Tests
console.log("3. Testing Date Filtering:");
const filteredJan = filterDataset(SEED_DATA, {
  dateRange: {
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-01-31T23:59:59Z",
  },
});
assert(filteredJan.orders.length > 0 && filteredJan.orders.length < 2000, "January orders should be a realistic subset");
for (const o of filteredJan.orders) {
  const time = new Date(o.createdAt).getTime();
  assert(
    time >= new Date("2026-01-01T00:00:00Z").getTime() &&
      time <= new Date("2026-01-31T23:59:59Z").getTime(),
    "All filtered orders must fall strictly within January 2026"
  );
}
console.log(`- January 2026 Orders: ${filteredJan.orders.length}`);
console.log("✅ Date filtering passed.\n");

// 4. Category Filtering Tests
console.log("4. Testing Category Filtering:");
const targetCat = SEED_DATA.categories[0].id; // Audio & Acoustics
const catRevenue = getTotalRevenue(SEED_DATA, { categories: [targetCat] });
assert(catRevenue > 0 && catRevenue < allRevenue, "Category revenue must be positive subset of total revenue");

const catBreakdown = getRevenueByCategory(SEED_DATA);
assert(catBreakdown.length === 10, "Category breakdown must return all 10 categories");
const sumBreakdownRevenue = catBreakdown.reduce((sum, c) => sum + c.revenue, 0);
assert(Math.abs(sumBreakdownRevenue - allRevenue) < 1.0, "Sum of category revenues must equal total revenue");
console.log(`- Top Category: ${catBreakdown[0].categoryName} ($${catBreakdown[0].revenue.toLocaleString()})`);
console.log("✅ Category filtering passed.\n");

// 5. Region Filtering Tests
console.log("5. Testing Region Filtering:");
const mhRevenue = getTotalRevenue(SEED_DATA, { regions: ["Maharashtra"] });
assert(mhRevenue > 0 && mhRevenue < allRevenue, "Maharashtra revenue must be valid subset");

const regionalBreakdown = getRevenueByRegion(SEED_DATA);
assert(regionalBreakdown.length === 10, "Regional breakdown must cover 10 states");
const sumRegionalRevenue = regionalBreakdown.reduce((sum, r) => sum + r.revenue, 0);
assert(Math.abs(sumRegionalRevenue - allRevenue) < 1.0, "Sum of regional revenues must equal total revenue");
console.log(`- Top Region: ${regionalBreakdown[0].region} (₹${regionalBreakdown[0].revenue.toLocaleString()})`);
console.log("✅ Region filtering passed.\n");

// 6. Status Filtering Tests
console.log("6. Testing Status Filtering:");
const statusBreakdown = getOrdersByStatus(SEED_DATA);
assert(statusBreakdown.length === 5, "Status breakdown must cover 5 statuses");
const totalStatusOrders = statusBreakdown.reduce((sum, s) => sum + s.count, 0);
assert(totalStatusOrders === 2000, "Sum of orders by status must equal total orders (2000)");

const deliveredOrders = getTotalOrders(SEED_DATA, { statuses: ["Delivered"] });
assert(deliveredOrders > 1500, "Delivered orders must be the predominant status");
console.log(`- Delivered: ${deliveredOrders}, Cancelled: ${statusBreakdown.find((s) => s.status === "Cancelled")?.count}`);
console.log("✅ Status filtering passed.\n");

// 7. Top Products, Customers & Cohorts Tests
console.log("7. Testing Top Products, Customers & Cohorts:");
const topProducts = getTopProducts(SEED_DATA, undefined, 5);
assert(topProducts.length === 5, "Top products must return requested limit (5)");
assert(topProducts[0].revenue >= topProducts[1].revenue, "Top products must be sorted descending by revenue");
console.log(`- #1 Product: ${topProducts[0].name} ($${topProducts[0].revenue.toLocaleString()})`);

const topCustomers = getTopCustomers(SEED_DATA, undefined, 5);
assert(topCustomers.length === 5, "Top customers must return requested limit (5)");
assert(topCustomers[0].totalSpend >= topCustomers[1].totalSpend, "Top customers must be sorted descending by spend");
console.log(`- #1 Customer: ${topCustomers[0].name} ($${topCustomers[0].totalSpend.toLocaleString()})`);

const cohorts = getCustomerCohortAnalysis(SEED_DATA);
assert(cohorts.totalActiveCustomers > 0, "Cohort total customers must be positive");
assert(cohorts.newCustomers + cohorts.returningCustomers === cohorts.totalActiveCustomers, "New + Returning must equal total active");
console.log(`- Cohorts: ${cohorts.newCustomers} New, ${cohorts.returningCustomers} Returning`);
console.log("✅ Top products, customers & cohorts passed.\n");

// 8. Time-series Day & Month Tests
console.log("8. Testing Time-Series Day & Month Grouping:");
const monthlyTrend = getRevenueByMonth(SEED_DATA);
assert(monthlyTrend.length >= 12, "Monthly trend must cover at least 12 distinct months");
for (let i = 1; i < monthlyTrend.length; i++) {
  assert(monthlyTrend[i].date > monthlyTrend[i - 1].date, "Months must be strictly chronologically sorted");
}
console.log(`- Total Months Generated: ${monthlyTrend.length} (from ${monthlyTrend[0].date} to ${monthlyTrend[monthlyTrend.length - 1].date})`);

const dailyTrend = getRevenueByDay(SEED_DATA, {
  dateRange: {
    startDate: "2026-06-01T00:00:00Z",
    endDate: "2026-06-30T23:59:59Z",
  },
});
assert(dailyTrend.length > 0 && dailyTrend.length <= 30, "Daily trend for June must return valid days");
console.log(`- Daily Trend June 2026: ${dailyTrend.length} active sales days`);
console.log("✅ Time-series grouping passed.\n");

// 9. Edge Cases: Empty Datasets & Invalid Ranges
console.log("9. Testing Edge Cases (Empty Dataset, Inverted Ranges):");
const emptyDataset: EcommerceDataset = {
  users: [],
  categories: [],
  products: [],
  customers: [],
  orders: [],
  orderItems: [],
};

assert(getTotalRevenue(emptyDataset) === 0, "Empty dataset revenue should be 0");
assert(getTotalOrders(emptyDataset) === 0, "Empty dataset orders should be 0");
assert(getTotalCustomers(emptyDataset) === 0, "Empty dataset customers should be 0");
assert(getAverageOrderValue(emptyDataset) === 0, "Empty dataset AOV should be 0 (no NaN)");
assert(getGrossProfit(emptyDataset) === 0, "Empty dataset profit should be 0");
assert(getGrossMargin(emptyDataset) === 0, "Empty dataset margin should be 0 (no division by zero)");
assert(getTopProducts(emptyDataset).length === 0, "Empty dataset top products should be empty array");
assert(getRevenueByMonth(emptyDataset).length === 0, "Empty dataset time series should be empty array");

const overviewEmpty = getOverviewMetrics(emptyDataset);
assert(overviewEmpty.totalRevenue === 0 && overviewEmpty.averageOrderValue === 0, "Overview empty metrics guarded");

// Inverted date range (start > end)
const invertedResult = filterDataset(SEED_DATA, {
  dateRange: {
    startDate: "2026-12-01T00:00:00Z",
    endDate: "2026-01-01T00:00:00Z",
  },
});
assert(invertedResult.orders.length === 0, "Inverted date range must return 0 orders safely");
console.log("✅ Empty datasets & inverted date ranges handled safely without exceptions.\n");

console.log("🎉 ALL 9 STEP 4 ANALYTICS CALCULATION TESTS PASSED SUCCESSFULLY!");
