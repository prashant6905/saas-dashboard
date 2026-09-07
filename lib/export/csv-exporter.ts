/**
 * Reusable, RFC 4180 compliant CSV export utility.
 *
 * Features:
 * - RFC 4180 value quoting and quote escaping ("" for ")
 * - Safe formula injection protection (escapes =, +, -, @ prefixes)
 * - Full Unicode support with UTF-8 Byte Order Mark (BOM: \uFEFF) for Excel compatibility
 * - Strongly typed column formatters
 * - Efficient handling of empty and large datasets
 * - Cross-browser download trigger helper
 */

export interface CSVColumn<T> {
  header: string;
  accessor: (item: T, index: number) => unknown;
}

/**
 * Escapes a single value for RFC 4180 CSV compliance and formula injection safety.
 */
export function escapeCSVValue(val: unknown): string {
  if (val === null || val === undefined) {
    return "";
  }

  // Handle Date objects
  if (val instanceof Date) {
    return `"${val.toISOString()}"`;
  }

  // Handle numbers and booleans directly
  if (typeof val === "number") {
    return Number.isFinite(val) ? String(val) : "";
  }
  if (typeof val === "boolean") {
    return val ? "true" : "false";
  }

  let str = String(val);

  // Security: Mitigate CSV formula injection in spreadsheet software (Excel, LibreOffice)
  // If the cell begins with =, +, -, or @, prefix with a single quote '
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  // RFC 4180: If value contains commas, double quotes, or newlines, enclose in quotes and escape quotes with ""
  if (/[",\n\r]/.test(str) || str.startsWith(" ") || str.endsWith(" ")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return `"${str}"`;
}

/**
 * Generates an RFC 4180 CSV string with a UTF-8 BOM from a dataset and column definitions.
 */
export function generateCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  // UTF-8 BOM (\uFEFF) ensures Excel, Numbers, and Google Sheets properly recognize UTF-8 Unicode
  const UTF8_BOM = "\uFEFF";

  const headerRow = columns.map((col) => escapeCSVValue(col.header)).join(",");

  if (!data || data.length === 0) {
    return `${UTF8_BOM}${headerRow}\r\n`;
  }

  const dataRows: string[] = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const rowValues = columns.map((col) => escapeCSVValue(col.accessor(item, i)));
    dataRows[i] = rowValues.join(",");
  }

  return `${UTF8_BOM}${headerRow}\r\n${dataRows.join("\r\n")}\r\n`;
}

/**
 * Initiates an in-browser download of a CSV file.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Standard column definition for Orders export.
 */
export interface OrderExportRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerSegment: string;
  createdAt: string;
  region: string;
  customerCity?: string;
  paymentMethod?: string;
  totalAmount: number;
  status: string;
  itemCount: number;
  categoryNames?: string[];
}

export const ORDERS_CSV_COLUMNS: CSVColumn<OrderExportRecord>[] = [
  { header: "Order ID", accessor: (o) => o.id },
  { header: "Customer Name", accessor: (o) => o.customerName },
  { header: "Customer Email", accessor: (o) => o.customerEmail },
  { header: "Customer Phone", accessor: (o) => o.customerPhone || "" },
  { header: "Customer Segment", accessor: (o) => o.customerSegment },
  { header: "Order Date", accessor: (o) => o.createdAt },
  { header: "State", accessor: (o) => o.region },
  { header: "City", accessor: (o) => o.customerCity || "" },
  { header: "Payment Method", accessor: (o) => o.paymentMethod || "UPI" },
  { header: "Amount (₹)", accessor: (o) => o.totalAmount.toFixed(2) },
  { header: "Status", accessor: (o) => o.status },
  { header: "Items Count", accessor: (o) => o.itemCount },
  {
    header: "Categories",
    accessor: (o) => (o.categoryNames && o.categoryNames.length > 0 ? o.categoryNames.join(", ") : "Uncategorized"),
  },
];
