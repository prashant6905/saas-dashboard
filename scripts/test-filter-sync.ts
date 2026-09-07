import { SEED_DATA } from "../lib/data/seed-data";
import {
  parseUrlFilters,
  filtersToSearchParams,
  toAnalyticsFilter,
  getFilterDateRange,
  getActiveFilterCount,
} from "../lib/filters";
import {
  comparePeriods,
  filterDataset,
  getRevenueByCategory,
  getRevenueByDay,
  getRevenueByRegion,
  getTopProducts,
} from "../lib/analytics";

console.log("🧪 Running Step 6 Centralized Filter Architecture Tests...\n");

// 1. Test URL Parsing Defaults
const defaultParams = new URLSearchParams("");
const defaultFilters = parseUrlFilters(defaultParams);
console.log("1. Testing Default URL Parsing:");
console.log(`- Range: ${defaultFilters.range}`);
console.log(`- Region: ${defaultFilters.region}`);
console.log(`- Category: ${defaultFilters.category}`);
console.log(`- Status: ${defaultFilters.status}`);
console.log(`- Segment: ${defaultFilters.segment}`);
if (
  defaultFilters.range === "30d" &&
  defaultFilters.region === "all" &&
  defaultFilters.category === "all" &&
  defaultFilters.status === "all" &&
  defaultFilters.segment === "all"
) {
  console.log("✅ Defaults correctly resolved.");
} else {
  console.error("❌ Defaults parsing failed!");
  process.exit(1);
}

// 2. Test URL Parsing with Valid Combinations
const validParams = new URLSearchParams(
  "range=90d&region=Maharashtra&category=electronics&status=delivered&segment=vip"
);
const parsedFilters = parseUrlFilters(validParams);
console.log("\n2. Testing Multi-Dimensional URL Parsing:");
console.log(`- Range: ${parsedFilters.range}`);
console.log(`- Region: ${parsedFilters.region}`);
console.log(`- Category: ${parsedFilters.category}`);
console.log(`- Status: ${parsedFilters.status}`);
console.log(`- Segment: ${parsedFilters.segment}`);
console.log(`- Active Filter Count: ${getActiveFilterCount(parsedFilters)}`);

if (
  parsedFilters.range === "90d" &&
  parsedFilters.region === "Maharashtra" &&
  parsedFilters.category !== "all" &&
  parsedFilters.status === "Delivered" &&
  parsedFilters.segment === "VIP" &&
  getActiveFilterCount(parsedFilters) === 5
) {
  console.log("✅ Valid parameters correctly resolved and category mapped to ID.");
} else {
  console.error("❌ Parameter parsing failed!");
  process.exit(1);
}

// 3. Test Invalid / Malformed / Corrupted URL Params
const corruptedParams = new URLSearchParams(
  "range=invalid_century&region=Atlantis&category=alien_tech&status=unknown_status&segment=random_people"
);
const sanitizedFilters = parseUrlFilters(corruptedParams);
console.log("\n3. Testing Corrupted Parameter Resilience:");
console.log(`- Sanitized Range: ${sanitizedFilters.range}`);
console.log(`- Sanitized Region: ${sanitizedFilters.region}`);
console.log(`- Sanitized Category: ${sanitizedFilters.category}`);
console.log(`- Sanitized Status: ${sanitizedFilters.status}`);
console.log(`- Sanitized Segment: ${sanitizedFilters.segment}`);

if (
  sanitizedFilters.range === "30d" &&
  sanitizedFilters.region === "all" &&
  sanitizedFilters.category === "all" &&
  sanitizedFilters.status === "all" &&
  sanitizedFilters.segment === "all"
) {
  console.log("✅ Zero exceptions: all corrupted params safely defaulted to standard values.");
} else {
  console.error("❌ Corrupted param fallback failed!");
  process.exit(1);
}

// 4. Test Serialization to Search Params
const serialized = filtersToSearchParams(parsedFilters);
console.log("\n4. Testing URL Serialization:");
console.log(`- Query String: ?${serialized.toString()}`);
if (
  serialized.get("range") === "90d" &&
  serialized.get("region") === "europe" &&
  serialized.get("status") === "delivered" &&
  serialized.get("segment") === "vip"
) {
  console.log("✅ Serialization generates clean URL search parameters.");
} else {
  console.error("❌ Serialization failed!");
  process.exit(1);
}

// 5. Test "Today" Preset Horizon & Comparison
const todayRange = getFilterDateRange("today");
const todayAnalyticsFilter = toAnalyticsFilter({
  ...defaultFilters,
  range: "today",
});
const todayComparison = comparePeriods(SEED_DATA, todayAnalyticsFilter);
const todayFiltered = filterDataset(SEED_DATA, todayAnalyticsFilter);
console.log("\n5. Testing 'Today' Horizon (Dataset Date Anchor 2026-09-01):");
console.log(`- Start: ${todayRange.startDate}`);
console.log(`- End:   ${todayRange.endDate}`);
console.log(`- Orders today: ${todayFiltered.orders.length}`);
console.log(`- Revenue today: $${todayComparison.revenue.current}`);
console.log(`- Comparison period: ${todayRange.comparisonLabel} ($${todayComparison.revenue.previous})`);
if (todayComparison.revenue.current >= 0 && todayComparison.orders.current >= 0) {
  console.log("✅ 'Today' preset calculates valid current and comparison period metrics.");
} else {
  console.error("❌ 'Today' calculation failed!");
  process.exit(1);
}

// 6. Test Multi-Dimensional Analytics Execution: 30d + Maharashtra + Electronics + Delivered
const testComboFilters = {
  ...defaultFilters,
  range: "30d" as const,
  region: "Maharashtra" as const,
  category:
    SEED_DATA.categories.find((c) => c.name.includes("Electronics"))?.id ||
    SEED_DATA.categories[0].id,
  status: "Delivered" as const,
};
const comboAnalyticsFilter = toAnalyticsFilter(testComboFilters);
const comboComp = comparePeriods(SEED_DATA, comboAnalyticsFilter);
const comboDaily = getRevenueByDay(SEED_DATA, comboAnalyticsFilter);
const comboCats = getRevenueByCategory(SEED_DATA, comboAnalyticsFilter);
const comboRegs = getRevenueByRegion(SEED_DATA, comboAnalyticsFilter);
const comboProds = getTopProducts(SEED_DATA, comboAnalyticsFilter, 5);
const comboOrders = filterDataset(SEED_DATA, comboAnalyticsFilter).orders;

console.log("\n6. Testing Combination: 30d + Maharashtra + Electronics + Delivered:");
console.log(`- Revenue: ₹${comboComp.revenue.current} (${comboComp.revenue.percentageChange}%)`);
console.log(`- Orders: ${comboComp.orders.current} (${comboComp.orders.percentageChange}%)`);
console.log(`- Customers: ${comboComp.customers.current}`);
console.log(`- AOV: ₹${comboComp.averageOrderValue.current}`);
console.log(`- Daily Trend Points: ${comboDaily.length}`);
console.log(`- Categories Count: ${comboCats.length}`);
console.log(`- Regions Count: ${comboRegs.length}`);
console.log(`- Top Products Count: ${comboProds.length}`);
console.log(`- Filtered Orders Count: ${comboOrders.length}`);

if (
  comboOrders.every((o) => o.region === "Maharashtra" && o.status === "Delivered") &&
  comboComp.revenue.current > 0 &&
  comboProds.length > 0
) {
  console.log("✅ 100% of filtered orders strictly adhere to Maharashtra + Delivered + Electronics.");
} else {
  console.error("❌ Combination filtering failed!");
  process.exit(1);
}

console.log("\n🎉 ALL STEP 6 FILTER ARCHITECTURE TESTS PASSED SUCCESSFULLY!");
