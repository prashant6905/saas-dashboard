import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server-auth";
import {
  generateCSVContent,
  ExportType,
  ExportFilterOptions,
} from "@/lib/export/generate-csv";
import { z } from "zod";

const ExportOptionsSchema = z.object({
  type: z.enum(["orders", "products", "customers", "analytics"]).default("orders"),
  search: z.string().max(200).optional(),
  status: z.string().max(50).optional(),
  region: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
  range: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).max(10000).optional(),
  pageSize: z.coerce.number().int().min(1).max(500).optional(),
  scope: z.enum(["page", "all"]).default("all"),
});

export async function POST(request: NextRequest) {
  // 1. Enforce server-side authorization
  const auth = await requirePermission(request, "data:export");
  if (!auth.authorized) {
    return auth.response;
  }

  // 2. Parse and validate request payload
  let rawBody: unknown = {};
  try {
    rawBody = await request.json();
  } catch {
    rawBody = {};
  }

  const parsed = ExportOptionsSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid export parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, ...options } = parsed.data;
  const { filename, content } = generateCSVContent(type as ExportType, options as ExportFilterOptions);

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: NextRequest) {
  // 1. Enforce server-side authorization
  const auth = await requirePermission(request, "data:export");
  if (!auth.authorized) {
    return auth.response;
  }

  const searchParams = request.nextUrl.searchParams;
  const rawParams = {
    type: searchParams.get("type") || "orders",
    search: searchParams.get("search") || undefined,
    status: searchParams.get("status") || undefined,
    region: searchParams.get("region") || undefined,
    category: searchParams.get("category") || undefined,
    range: searchParams.get("range") || undefined,
    page: searchParams.get("page") || undefined,
    pageSize: searchParams.get("pageSize") || undefined,
    scope: searchParams.get("scope") || "all",
  };

  const parsed = ExportOptionsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid export query parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { type, ...options } = parsed.data;
  const { filename, content } = generateCSVContent(type as ExportType, options as ExportFilterOptions);

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
