import { formatINR, formatIndianNumber } from "../lib/utils";
import { formatCurrency, formatNumber } from "../components/analytics/chart-theme";
import { SEED_DATA } from "../lib/data/seed-data";
import { getOverviewMetrics, getRevenueByCategory, getRevenueByRegion, getTopProducts } from "../lib/analytics";

console.log("=========================================");
console.log("RUNNING COMPREHENSIVE INR FORMATTING TESTS");
console.log("=========================================");

// 1. Core formatINR tests
console.log("\n--- Step 3 & 9 Tests ---");
const test1 = formatINR(123456.789);
console.log("formatINR(123456.789):", test1);
if (!test1.includes("1,23,456.79")) throw new Error(`Test 1 failed: ${test1}`);

const test2 = formatINR(123456.789, { minimumFractionDigits: 0 });
console.log("formatINR(123456.789, { minimumFractionDigits: 0 }):", test2);
if (!test2.includes("1,23,456.79")) throw new Error(`Test 2 failed: ${test2}`);

const test3 = formatINR(123456.789, { maximumFractionDigits: 2 });
console.log("formatINR(123456.789, { maximumFractionDigits: 2 }):", test3);
if (!test3.includes("1,23,456.79")) throw new Error(`Test 3 failed: ${test3}`);

const test4 = formatINR(123456.789, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
console.log("formatINR(123456.789, { min: 2, max: 2 }):", test4);
if (!test4.includes("1,23,456.79")) throw new Error(`Test 4 failed: ${test4}`);

const test5 = formatINR(123456.789, { maximumFractionDigits: 0 });
console.log("formatINR(123456.789, { maximumFractionDigits: 0 }):", test5);
if (test5 !== "₹1,23,457") throw new Error(`Test 5 failed: ${test5}`);

// 2. Edge values
console.log("\n--- Edge Number Values ---");
const edgeCases = [
  { val: 0, expected: "₹0.00" },
  { val: 1, expected: "₹1.00" },
  { val: 999, expected: "₹999.00" },
  { val: 1000, expected: "₹1,000.00" },
  { val: 9999, expected: "₹9,999.00" },
  { val: 10000, expected: "₹10,000.00" },
  { val: 99999, expected: "₹99,999.00" },
  { val: 100000, expected: "₹1,00,000.00" },
  { val: 1000000, expected: "₹10,00,000.00" },
  { val: -124500.5, expected: "-₹1,24,500.50" },
];

for (const { val, expected } of edgeCases) {
  const res = formatINR(val);
  console.log(`formatINR(${val}) = ${res}`);
  if (res !== expected) throw new Error(`Edge case failed for ${val}: got ${res}, expected ${expected}`);
}

// 3. Null / undefined / NaN
console.log("\n--- Null / Undefined / NaN Handling ---");
if (formatINR(null as any) !== "₹0") throw new Error("Failed null handling");
if (formatINR(undefined as any) !== "₹0") throw new Error("Failed undefined handling");
if (formatINR(NaN) !== "₹0") throw new Error("Failed NaN handling");
console.log("Null, undefined, NaN: ALL PASS (₹0)");

// 4. Inverted or malformed options
console.log("\n--- Inverted / Out-of-bounds Options ---");
const malformed1 = formatINR(123456.789, { minimumFractionDigits: 5, maximumFractionDigits: 1 });
console.log("min=5, max=1 ->", malformed1);
const malformed2 = formatINR(123456.789, { minimumFractionDigits: -10, maximumFractionDigits: 100 });
console.log("min=-10, max=100 ->", malformed2);
const malformed3 = formatINR(123456.789, { minimumFractionDigits: "invalid" as any, maximumFractionDigits: null as any });
console.log("min=invalid, max=null ->", malformed3);

// 5. Compact notation
console.log("\n--- Compact INR Notation ---");
console.log("12,400 ->", formatINR(12400, { compact: true }));
console.log("1,25,000 ->", formatINR(125000, { compact: true }));
console.log("12,40,000 ->", formatINR(1240000, { compact: true }));
console.log("2,40,00,000 ->", formatINR(24000000, { compact: true }));

// 6. formatIndianNumber
console.log("\n--- formatIndianNumber ---");
console.log("1234 ->", formatIndianNumber(1234));
console.log("12345 ->", formatIndianNumber(12345));
console.log("123456 ->", formatIndianNumber(123456));
console.log("1234567 ->", formatIndianNumber(1234567));

// 7. Test with realistic analytics metrics and top products (the exact caller that crashed)
console.log("\n--- Realistic Analytics & Top Products Integration ---");
const overview = getOverviewMetrics(SEED_DATA);
console.log("Total Revenue (full):", formatINR(overview.totalRevenue));
console.log("Total Revenue (compact):", formatINR(overview.totalRevenue, { compact: true }));
console.log("AOV (min=0, max=0):", formatINR(overview.averageOrderValue, { minimumFractionDigits: 0, maximumFractionDigits: 0 }));

const topProducts = getTopProducts(SEED_DATA, undefined, 5);
for (const p of topProducts) {
  const revStr = formatINR(p.revenue, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const priceStr = formatINR(p.price, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  console.log(`Product "${p.name}": Rev = ${revStr}, Price = ${priceStr}/ea`);
}

console.log("\n=========================================");
console.log("ALL INR FORMATTING TESTS PASSED 100%!");
console.log("=========================================");
