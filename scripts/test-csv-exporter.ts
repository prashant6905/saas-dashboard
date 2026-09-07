import {
  escapeCSVValue,
  generateCSV,
  CSVColumn,
  ORDERS_CSV_COLUMNS,
} from "../lib/export/csv-exporter";
import { getOrderTableRows } from "../lib/data/orders";

console.log("🧪 Running Step 15 CSV Exporter & RFC 4180 Compliance Tests...\n");

// =========================================================================
// TEST 1: RFC 4180 Escaping & Quoting
// =========================================================================
console.log("--- Test 1: RFC 4180 Quoting & Escaping ---");

// Normal string
const normal = escapeCSVValue("Simple Text");
if (normal !== '"Simple Text"') throw new Error(`Normal string failed: ${normal}`);
console.log(`✅ Simple string: ${normal}`);

// String with comma
const withComma = escapeCSVValue("Smith, John");
if (withComma !== '"Smith, John"') throw new Error(`Comma escaping failed: ${withComma}`);
console.log(`✅ String with comma: ${withComma}`);

// String with quotes
const withQuotes = escapeCSVValue('The "Premium" Widget');
if (withQuotes !== '"The ""Premium"" Widget"') throw new Error(`Quotes escaping failed: ${withQuotes}`);
console.log(`✅ String with double quotes: ${withQuotes}`);

// String with newline
const withNewline = escapeCSVValue("Line 1\nLine 2");
if (withNewline !== '"Line 1\nLine 2"') throw new Error(`Newline escaping failed: ${withNewline}`);
console.log(`✅ String with newline: properly enclosed in quotes`);

// Numbers and booleans
const num = escapeCSVValue(1234.56);
if (num !== "1234.56") throw new Error(`Number failed: ${num}`);
const boolTrue = escapeCSVValue(true);
if (boolTrue !== "true") throw new Error(`Boolean true failed: ${boolTrue}`);
console.log(`✅ Numbers and booleans formatted: ${num}, ${boolTrue}`);

// Null and undefined
if (escapeCSVValue(null) !== "" || escapeCSVValue(undefined) !== "") {
  throw new Error("Null/undefined escaping failed");
}
console.log("✅ Null and undefined values cleanly yield empty string.");

// =========================================================================
// TEST 2: Formula Injection Safety (CSV Injection / DDE attack prevention)
// =========================================================================
console.log("\n--- Test 2: Formula Injection Prevention ---");
const formulaEq = escapeCSVValue("=SUM(A1:A10)");
if (!formulaEq.includes("'=SUM(A1:A10)")) throw new Error(`Formula = injection failed: ${formulaEq}`);

const formulaPlus = escapeCSVValue("+cmd|' /C calc'!A0");
if (!formulaPlus.includes("'+cmd")) throw new Error(`Formula + injection failed: ${formulaPlus}`);

const formulaMinus = escapeCSVValue("-10+20");
if (!formulaMinus.includes("'-10+20")) throw new Error(`Formula - injection failed: ${formulaMinus}`);

const formulaAt = escapeCSVValue("@SUM(B1:B5)");
if (!formulaAt.includes("'@SUM")) throw new Error(`Formula @ injection failed: ${formulaAt}`);

console.log("✅ All dangerous spreadsheet formula prefixes (=, +, -, @) safely neutralized with single quote prefix.");

// =========================================================================
// TEST 3: Unicode & Multilingual Support
// =========================================================================
console.log("\n--- Test 3: Unicode & Multilingual Support ---");
const unicodeNames = [
  "Renée Dubois",
  "Jürgen Müller",
  "田中 太郎",
  "طارق المنصور",
  "José García",
  "Łukasz Kowalski",
  "€ 1,250.00",
  "🎧 Audio Pro",
];

for (const name of unicodeNames) {
  const escaped = escapeCSVValue(name);
  if (!escaped.includes(name)) throw new Error(`Unicode failed for: ${name}`);
}
console.log("✅ Multi-language Unicode characters, accents, diacritics, and currency symbols preserved perfectly.");

// =========================================================================
// TEST 4: UTF-8 BOM Header Verification
// =========================================================================
console.log("\n--- Test 4: UTF-8 Byte Order Mark (BOM) ---");
interface TestRow { id: string; name: string; }
const testCols: CSVColumn<TestRow>[] = [
  { header: "ID", accessor: (r) => r.id },
  { header: "Name", accessor: (r) => r.name },
];
const testCSV = generateCSV([{ id: "1", name: "Test" }], testCols);

if (!testCSV.startsWith("\uFEFF")) {
  throw new Error("CSV does not begin with UTF-8 BOM (\\uFEFF)");
}
console.log("✅ UTF-8 BOM (\\uFEFF) present at start of CSV stream for seamless Microsoft Excel rendering.");

// =========================================================================
// TEST 5: Empty Results Handling
// =========================================================================
console.log("\n--- Test 5: Empty Results Handling ---");
const emptyCSV = generateCSV<TestRow>([], testCols);
if (!emptyCSV.startsWith("\uFEFF")) throw new Error("Empty CSV missing BOM");
if (!emptyCSV.includes('"ID","Name"')) throw new Error("Empty CSV missing header row");
const lines = emptyCSV.trim().split("\r\n");
if (lines.length !== 1) throw new Error(`Expected exactly 1 line (headers), got ${lines.length}`);
console.log("✅ Empty result set formats valid CSV containing headers and 0 data rows.");

// =========================================================================
// TEST 6: Large Dataset Performance Benchmark
// =========================================================================
console.log("\n--- Test 6: Large Dataset Performance Benchmark ---");
const allOrders = getOrderTableRows();
console.log(`Loaded ${allOrders.length.toLocaleString()} orders from data layer.`);

const t0 = performance.now();
const ordersCSV = generateCSV(allOrders, ORDERS_CSV_COLUMNS);
const elapsed = performance.now() - t0;

if (!ordersCSV.startsWith("\uFEFF")) throw new Error("Orders CSV missing BOM");
const orderLines = ordersCSV.trim().split("\r\n");
if (orderLines.length !== 2001) { // 1 header + 2000 data rows
  throw new Error(`Expected 2001 lines, got ${orderLines.length}`);
}

console.log(`Generated ${orderLines.length} CSV lines (${ordersCSV.length.toLocaleString()} bytes) in ${elapsed.toFixed(2)} ms.`);
if (elapsed > 200) {
  console.warn("⚠️ Performance slower than expected, but acceptable.");
} else {
  console.log("⚡ Blazing fast execution: < 200ms benchmark met.");
}

console.log("\n=======================================================================");
console.log("🎉 ALL CSV EXPORTER & RFC 4180 COMPLIANCE TESTS PASSED SUCCESSFULLY!");
console.log("=======================================================================\n");
