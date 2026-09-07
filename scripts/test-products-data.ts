import { getProductTableRows, getProductDetailById } from "../lib/data/products";
import {
  parseProductsUrlParams,
  productsFiltersToSearchParams,
  getProductsActiveFilterCount,
} from "../lib/filters/products-url-sync";

console.log("🧪 Running Step 9 Products Data & Analytics Unit Tests...\n");

// 1. Validate Product Catalog Rows
const products = getProductTableRows();
console.log("1. Validating Product Catalog Enrichment:");
console.log(`- Total Catalog Products: ${products.length}`);
if (products.length === 150) {
  console.log("✅ Exactly 150 products enriched.");
} else {
  console.error(`❌ Expected 150 products, got ${products.length}`);
  process.exit(1);
}

// 2. Validate Fields & Math Consistency
console.log("\n2. Testing Product Fields and Math Consistency:");
const invalidProduct = products.find(
  (p) =>
    !p.id ||
    !p.name ||
    !p.categoryName ||
    p.price <= 0 ||
    p.cost <= 0 ||
    p.stock < 0 ||
    !p.stockStatus ||
    !p.performance
);
if (!invalidProduct) {
  console.log("✅ 100% of products contain valid pricing, category, stock, and performance metadata.");
} else {
  console.error("❌ Found invalid product row:", invalidProduct);
  process.exit(1);
}

const sample = products[0];
const expectedProfit = Math.round((sample.revenue - sample.unitsSold * sample.cost) * 100) / 100;
if (Math.abs(sample.grossProfit - expectedProfit) < 0.05) {
  console.log(`✅ Gross profit calculation ($${sample.grossProfit}) matches revenue minus COGS ($${expectedProfit}).`);
} else {
  console.error(`❌ Profit calculation mismatch! Expected ${expectedProfit}, got ${sample.grossProfit}`);
  process.exit(1);
}

// 3. Test Stock Statuses (In Stock, Low Stock, Out of Stock)
console.log("\n3. Testing Stock Status Distribution:");
const inStock = products.filter((p) => p.stockStatus === "In Stock");
const lowStock = products.filter((p) => p.stockStatus === "Low Stock");
const outOfStock = products.filter((p) => p.stockStatus === "Out of Stock");

console.log(`- In Stock:     ${inStock.length}`);
console.log(`- Low Stock:    ${lowStock.length}`);
console.log(`- Out of Stock: ${outOfStock.length}`);

if (inStock.length > 0 && lowStock.length > 0 && outOfStock.length > 0) {
  console.log("✅ All 3 stock statuses (In Stock, Low Stock, Out of Stock) verified and populated.");
} else {
  console.error("❌ Missing one or more stock statuses!");
  process.exit(1);
}

// 4. Test Performance Tiering
console.log("\n4. Testing Performance Tiering:");
const topPerf = products.filter((p) => p.performance === "Top Performer");
const strongPerf = products.filter((p) => p.performance === "Strong");
const avgPerf = products.filter((p) => p.performance === "Average");
const underPerf = products.filter((p) => p.performance === "Underperforming");

console.log(`- Top Performers:   ${topPerf.length}`);
console.log(`- Strong:           ${strongPerf.length}`);
console.log(`- Average:          ${avgPerf.length}`);
console.log(`- Underperforming:  ${underPerf.length}`);

if (topPerf.length > 0 && strongPerf.length > 0 && avgPerf.length > 0 && underPerf.length > 0) {
  console.log("✅ All 4 performance tiers verified.");
} else {
  console.error("❌ Performance tiering failed!");
  process.exit(1);
}

// 5. Test Product Detail View Data Query
console.log("\n5. Testing getProductDetailById('prod_0001'):");
const detail = getProductDetailById("prod_0001");
if (!detail) {
  console.error("❌ Could not find product 'prod_0001'");
  process.exit(1);
}

console.log(`- Name: ${detail.name}`);
console.log(`- Revenue: $${detail.totalRevenue}`);
console.log(`- Units Sold: ${detail.unitsSold}`);
console.log(`- Profit: $${detail.grossProfit} (${detail.grossMargin.toFixed(1)}%)`);
console.log(`- Monthly Sales Trend Points: ${detail.salesTrend.length}`);
console.log(`- Recent Orders Count: ${detail.recentOrders.length}`);

if (
  detail.id === "prod_0001" &&
  detail.name &&
  detail.salesTrend.length > 0 &&
  detail.recentOrders.length > 0
) {
  console.log("✅ Product detail view data successfully aggregated.");
} else {
  console.error("❌ Product detail view data validation failed!");
  process.exit(1);
}

// 6. Test Invalid Product IDs
console.log("\n6. Testing Invalid Product ID Handling:");
const missingProd = getProductDetailById("prod_9999");
const invalidProd = getProductDetailById("invalid_sku_xyz");
const emptyProd = getProductDetailById("");

if (missingProd === null && invalidProd === null && emptyProd === null) {
  console.log("✅ Invalid and missing product queries safely return null.");
} else {
  console.error("❌ Invalid product ID query failed!");
  process.exit(1);
}

// 7. Test URL State Sync
console.log("\n7. Testing Products URL Filter Synchronization:");
const params = new URLSearchParams("search=wireless&category=cat_01&stock=Low+Stock&page=2&pageSize=10&sort=price&order=asc");
const parsed = parseProductsUrlParams(params);

console.log(`- Parsed Search: ${parsed.search}`);
console.log(`- Parsed Category: ${parsed.category}`);
console.log(`- Parsed Stock: ${parsed.stockStatus}`);
console.log(`- Parsed Page: ${parsed.page}`);
console.log(`- Parsed Sort: ${parsed.sortBy} ${parsed.sortOrder}`);
console.log(`- Active filter count: ${getProductsActiveFilterCount(parsed)}`);

if (
  parsed.search === "wireless" &&
  parsed.category === "cat_01" &&
  parsed.stockStatus === "Low Stock" &&
  parsed.page === 2 &&
  parsed.pageSize === 10 &&
  parsed.sortBy === "price" &&
  parsed.sortOrder === "asc"
) {
  console.log("✅ Products URL parameters correctly parsed.");
} else {
  console.error("❌ Products URL parameters parsing failed!");
  process.exit(1);
}

const serialized = productsFiltersToSearchParams(parsed);
if (serialized.get("search") === "wireless" && serialized.get("category") === "cat_01") {
  console.log("✅ productsFiltersToSearchParams serialized correctly.");
}

console.log("\n🎉 ALL STEP 9 PRODUCTS UNIT TESTS PASSED SUCCESSFULLY!");
