import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server-auth";
import { z } from "zod";

const SettingsPayloadSchema = z
  .object({
    workspaceName: z.string().min(1).max(100).optional(),
    tier: z.enum(["Free", "Starter", "Enterprise", "Enterprise Pro"]).optional(),
    rbacPolicy: z.enum(["Permissive", "Standard", "Strict", "Enforced"]).optional(),
    supabaseStatus: z.enum(["Connected", "Disconnected", "Syncing"]).optional(),
    telemetryEnabled: z.boolean().optional(),
  })
  .passthrough(); // allows extensible settings while ensuring shape validity

export async function GET(request: NextRequest) {
  const auth = await requirePermission(request, "access:settings");
  if (!auth.authorized) {
    return auth.response;
  }

  return NextResponse.json({
    workspace: {
      slug: "cmd-center-prod-01",
      tier: "Enterprise Pro",
      rbacPolicy: "Strict",
      supabaseStatus: "Connected",
      adminUser: auth.user.email,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, "access:settings");
  if (!auth.authorized) {
    return auth.response;
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  const parseResult = SettingsPayloadSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        error: "Validation error on settings payload",
        code: "VALIDATION_ERROR",
        details: parseResult.error.flatten(),
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Administrative settings updated successfully.",
    updatedBy: auth.user.email,
    timestamp: new Date().toISOString(),
    changes: parseResult.data,
  });
}

