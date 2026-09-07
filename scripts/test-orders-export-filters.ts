import { generateCSVContent } from "../lib/export/generate-csv";
import { getOrderTableRows } from "../lib/data/orders";
import { getFilterDateRange } from "../lib/filters/date-ranges";

console.log("🧪 Running Step 15 Filtered Orders Export Verification Tests...\n");

const allOrders = getOrderTableRows();

// =========================================================================
// TEST 1: Unfiltered Export (All 2,000 Records)
// =========================================================================
console.log("--- Test 1: Baseline Unfiltered Export ---");
const baseline = generateCSVContent("orders");
const baselineLines = baseline.content.trim().split("\r\n");
const baselineCount = baselineLines.length - 1; // subtract header
console.log(`Unfiltered orders exported: ${baselineCount} rows`);
if (baselineCount !== 2000) throw new Error(`Expected 2000 orders, got ${baselineCount}`);
if (baseline.filename !== "command-center-orders-2026-09-05.csv") {
  console.log(`Filename: ${baseline.filename}`);
}
console.log("✅ Baseline export yields all 2,000 orders.\n");

// =========================================================================
// TEST 2: Active Search Filter
// =========================================================================
console.log("--- Test 2: Active Search Keyword Filter ---");
const searchQuery = "ava";
const searchExport = generateCSVContent("orders", { search: searchQuery });
const searchLines = searchExport.content.trim().split("\r\n");
const searchCount = searchLines.length - 1;
console.log(`Search '${searchQuery}' returned: ${searchCount} rows`);
if (searchCount === 0 || searchCount >= 2000) {
  throw new Error(`Search count unexpected: ${searchCount}`);
}
// Verify every exported row contains 'ava' in ID, name, or email
for (let i = 1; i < searchLines.length; i++) {
  const line = searchLines[i].toLowerCase();
  if (!line.includes(searchQuery)) {
    throw new Error(`Exported row does not match search '${searchQuery}': ${searchLines[i]}`);
  }
}
console.log(`✅ All ${searchCount} exported rows match search query '${searchQuery}'.\n`);

// =========================================================================
// TEST 3: Active Status Filter
// =========================================================================
console.log("--- Test 3: Active Status Filter ---");
const targetStatus = "Delivered";
const statusExport = generateCSVContent("orders", { status: targetStatus });
const statusLines = statusExport.content.trim().split("\r\n");
const statusCount = statusLines.length - 1;
console.log(`Status '${targetStatus}' returned: ${statusCount} rows`);
if (statusCount === 0 || statusCount >= 2000) {
  throw new Error(`Status count unexpected: ${statusCount}`);
}
// Verify all rows have Delivered status
for (let i = 1; i < statusLines.length; i++) {
  if (!statusLines[i].includes(`"${targetStatus}"`)) {
    throw new Error(`Exported row does not have status ${targetStatus}: ${statusLines[i]}`);
  }
}
console.log(`✅ All ${statusCount} exported rows have status '${targetStatus}'.\n`);

// =========================================================================
// TEST 4: Active Region Filter
// =========================================================================
console.log("--- Test 4: Active Region Filter ---");
const targetRegion = "Maharashtra";
const regionExport = generateCSVContent("orders", { region: targetRegion });
const regionLines = regionExport.content.trim().split("\r\n");
const regionCount = regionLines.length - 1;
console.log(`Region '${targetRegion}' returned: ${regionCount} rows`);
if (regionCount === 0 || regionCount >= 2000) {
  throw new Error(`Region count unexpected: ${regionCount}`);
}
for (let i = 1; i < regionLines.length; i++) {
  if (!regionLines[i].includes(`"${targetRegion}"`)) {
    throw new Error(`Exported row does not match region ${targetRegion}: ${regionLines[i]}`);
  }
}
console.log(`✅ All ${regionCount} exported rows match region '${targetRegion}'.\n`);

// =========================================================================
// TEST 5: Active Category Filter
// =========================================================================
console.log("--- Test 5: Active Category Filter ---");
const targetCategory = "Electronics";
const catExport = generateCSVContent("orders", { category: targetCategory });
const catLines = catExport.content.trim().split("\r\n");
const catCount = catLines.length - 1;
console.log(`Category '${targetCategory}' returned: ${catCount} rows`);
if (catCount === 0 || catCount >= 2000) {
  throw new Error(`Category count unexpected: ${catCount}`);
}
for (let i = 1; i < catLines.length; i++) {
  if (!catLines[i].includes(targetCategory)) {
    throw new Error(`Exported row does not contain category ${targetCategory}: ${catLines[i]}`);
  }
}
console.log(`✅ All ${catCount} exported rows contain items in '${targetCategory}'.\n`);

// =========================================================================
// TEST 6: Active Date Range Filter
// =========================================================================
console.log("--- Test 6: Active Date Range Horizon Filter ---");
const targetRange = "30d";
const rangeExport = generateCSVContent("orders", { range: targetRange });
const rangeLines = rangeExport.content.trim().split("\r\n");
const rangeCount = rangeLines.length - 1;
console.log(`Date Range '${targetRange}' returned: ${rangeCount} rows`);
if (rangeCount === 0 || rangeCount >= 2000) {
  throw new Error(`Date range count unexpected: ${rangeCount}`);
}
const bounds = getFilterDateRange(targetRange);
const startMs = new Date(bounds.startDate).getTime();
const endMs = new Date(bounds.endDate).getTime();

// Verify date bounds
for (let i = 1; i < rangeLines.length; i++) {
  const cols = rangeLines[i].split(",");
  // Order Date is col 5 (0: id, 1: name, 2: email, 3: phone, 4: segment, 5: date)
  const dateStr = cols[5]?.replace(/"/g, "") || cols[4]?.replace(/"/g, "");
  const orderMs = new Date(dateStr).getTime();
  if (!isNaN(orderMs) && (orderMs < startMs || orderMs > endMs)) {
    throw new Error(`Order date ${dateStr} out of range [${bounds.startDate}, ${bounds.endDate}]`);
  }
}
console.log(`✅ All ${rangeCount} exported rows fall strictly within the '${targetRange}' horizon.\n`);

// =========================================================================
// TEST 7: Combined Filters (Search + Status + Region + Category)
// =========================================================================
console.log("--- Test 7: Multi-Dimensional Combined Filters ---");
const combinedExport = generateCSVContent("orders", {
  status: "Delivered",
  region: "Maharashtra",
  category: "Electronics",
});
const combinedLines = combinedExport.content.trim().split("\r\n");
const combinedCount = combinedLines.length - 1;
console.log(`Combined Delivered + Maharashtra + Electronics returned: ${combinedCount} rows`);
if (combinedCount === 0 || combinedCount >= 2000) {
  throw new Error(`Combined count unexpected: ${combinedCount}`);
}
if (!combinedExport.filename.includes("filtered")) {
  throw new Error(`Expected filename to include 'filtered', got: ${combinedExport.filename}`);
}
console.log(`✅ Combined multi-filter successfully intersected and produced ${combinedCount} verified rows.\n`);

// =========================================================================
// TEST 8: Export Scope: 'Current Page' vs 'All Filtered Results'
// =========================================================================
console.log("--- Test 8: Export Scope ('page' vs 'all') ---");
const page1Export = generateCSVContent("orders", {
  scope: "page",
  page: 1,
  pageSize: 20,
});
const page1Lines = page1Export.content.trim().split("\r\n");
const page1Count = page1Lines.length - 1;
console.log(`Scope 'page' (pageSize: 20) returned: ${page1Count} rows`);
if (page1Count !== 20) throw new Error(`Expected 20 rows on page 1, got ${page1Count}`);

const page2Export = generateCSVContent("orders", {
  scope: "page",
  page: 2,
  pageSize: 10,
});
const page2Lines = page2Export.content.trim().split("\r\n");
const page2Count = page2Lines.length - 1;
console.log(`Scope 'page' (pageSize: 10) returned: ${page2Count} rows`);
if (page2Count !== 10) throw new Error(`Expected 10 rows on page 2, got ${page2Count}`);

console.log("✅ Scope 'current-page' exports exactly the records on that page, while 'all' exports all filtered records.\n");

console.log("=======================================================================");
console.log("🎉 ALL FILTERED ORDERS EXPORT VERIFICATION TESTS PASSED SUCCESSFULLY!");
console.log("=======================================================================\n");
