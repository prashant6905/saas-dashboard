import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export interface FormatINROptions {
  compact?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Formats monetary amounts in Indian Rupees (₹) following the Indian numbering system.
 * Supports compact notation (₹12.4L, ₹1.25Cr, ₹85K) and standard notation (₹12,45,000.00).
 */
export function formatINR(value: number, options?: FormatINROptions): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "₹0";
  }

  const isNegative = value < 0;
  const absVal = Math.abs(value);

  if (options?.compact) {
    let result = "";
    if (absVal >= 10_000_000) {
      // Crores (1 Cr = 1,00,00,000)
      const crVal = absVal / 10_000_000;
      const decimals = absVal % 10_000_000 === 0 ? 0 : crVal >= 10 ? 1 : 2;
      result = `₹${crVal.toFixed(decimals).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1")}Cr`;
    } else if (absVal >= 100_000) {
      // Lakhs (1 L = 1,00,000)
      const lVal = absVal / 100_000;
      const decimals = absVal % 100_000 === 0 ? 0 : lVal >= 10 ? 1 : 2;
      result = `₹${lVal.toFixed(decimals).replace(/\.00$/, "").replace(/(\.[1-9])0$/, "$1")}L`;
    } else if (absVal >= 1_000) {
      // Thousands
      const kVal = absVal / 1_000;
      const decimals = absVal % 1_000 === 0 ? 0 : 1;
      result = `₹${kVal.toFixed(decimals).replace(/\.0$/, "")}K`;
    } else {
      result = `₹${Math.round(absVal)}`;
    }
    return isNegative ? `-${result}` : result;
  }

  // Normalize and clamp fraction digits within valid JavaScript Intl range [0, 20]
  const sanitizeDigits = (val: unknown, fallback: number): number => {
    if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
      return fallback;
    }
    return Math.max(0, Math.min(20, Math.floor(val)));
  };

  const hasMin = options?.minimumFractionDigits !== undefined && !isNaN(Number(options.minimumFractionDigits));
  const hasMax = options?.maximumFractionDigits !== undefined && !isNaN(Number(options.maximumFractionDigits));

  let minDigits = 2;
  let maxDigits = 2;

  if (hasMin && hasMax) {
    minDigits = sanitizeDigits(options!.minimumFractionDigits, 2);
    maxDigits = sanitizeDigits(options!.maximumFractionDigits, 2);
    // ECMAScript Intl requires minDigits <= maxDigits
    if (minDigits > maxDigits) {
      minDigits = maxDigits;
    }
  } else if (hasMax) {
    maxDigits = sanitizeDigits(options!.maximumFractionDigits, 2);
    // If only maxDigits is given, minDigits must not exceed maxDigits
    minDigits = Math.min(2, maxDigits);
  } else if (hasMin) {
    minDigits = sanitizeDigits(options!.minimumFractionDigits, 2);
    // If only minDigits is given, maxDigits must not be lower than minDigits
    maxDigits = Math.max(2, minDigits);
  }

  let formattedNumber: string;
  try {
    formattedNumber = absVal.toLocaleString("en-IN", {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
  } catch {
    formattedNumber = absVal.toLocaleString("en-IN");
  }

  return isNegative ? `-₹${formattedNumber}` : `₹${formattedNumber}`;
}

/**
 * Formats counts or unit quantities using the Indian numbering system (e.g. 8,492, 1,25,000).
 */
export function formatIndianNumber(value: number, compact = false): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  const isNegative = value < 0;
  const absVal = Math.abs(value);

  if (compact) {
    let result = "";
    if (absVal >= 10_000_000) {
      result = `${(absVal / 10_000_000).toFixed(1).replace(/\.0$/, "")}Cr`;
    } else if (absVal >= 100_000) {
      result = `${(absVal / 100_000).toFixed(1).replace(/\.0$/, "")}L`;
    } else if (absVal >= 1_000) {
      result = `${(absVal / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
    } else {
      result = `${Math.round(absVal)}`;
    }
    return isNegative ? `-${result}` : result;
  }

  const formatted = absVal.toLocaleString("en-IN");
  return isNegative ? `-${formatted}` : formatted;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Formats a date in the preferred Indian style:
 * - "medium": "06 Sep 2026"
 * - "long": "6 September 2026"
 * - "short": "06/09/2026"
 */
export function formatIndianDate(
  dateInput: string | Date | number,
  style: "short" | "medium" | "long" = "medium"
): string {
  if (!dateInput) return "";

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const day = date.getDate();
  const dayPadded = day.toString().padStart(2, "0");
  const month = date.getMonth();
  const year = date.getFullYear();

  switch (style) {
    case "short":
      return `${dayPadded}/${(month + 1).toString().padStart(2, "0")}/${year}`;
    case "long":
      return `${day} ${MONTHS_LONG[month]} ${year}`;
    case "medium":
    default:
      return `${dayPadded} ${MONTHS_SHORT[month]} ${year}`;
  }
}

/**
 * Formats date and time in Indian style (e.g. "06 Sep 2026, 10:30 AM").
 */
export function formatIndianDateTime(dateInput: string | Date | number): string {
  if (!dateInput) return "";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const datePart = formatIndianDate(date, "medium");
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // hour '0' should be '12'

  return `${datePart}, ${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

