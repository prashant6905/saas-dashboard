/**
 * Server-side & Direct Restricted Action Verification for Step 13 RBAC
 * 
 * Verifies:
 * - Admin can access allowed features and export data.
 * - Viewer can view analytics and data pages.
 * - Viewer CANNOT export (receives 403 Forbidden upon direct API attempt).
 * - Viewer CANNOT access admin settings (receives redirect / 403 Forbidden upon direct attempt).
 * - Unauthenticated requests receive 401 Unauthorized.
 */

import { signSessionPayload } from "../lib/auth/session-crypto";
import type { Role } from "@/types/ecommerce";

async function runRBACServerTests() {
  console.log("🛡️ Running Direct RBAC Server-Side Authorization Tests against http://localhost:3000...\n");

  const baseUrl = "http://localhost:3000";
  const COOKIE_NAME = "cc_auth_session";

  const adminUser = {
    id: "usr_admin",
    email: "admin@commandcenter.io",
    name: "Alex Director",
    role: "ADMIN" as Role,
  };
  const adminToken = await signSessionPayload(adminUser);
  const adminCookie = `${COOKIE_NAME}=${adminToken}`;

  const viewerUser = {
    id: "usr_viewer",
    email: "viewer@commandcenter.io",
    name: "Sam Analyst",
    role: "VIEWER" as Role,
  };
  const viewerToken = await signSessionPayload(viewerUser);
  const viewerCookie = `${COOKIE_NAME}=${viewerToken}`;

  // =========================================================================
  // 1. ADMIN: Access Allowed Features
  // =========================================================================
  console.log("1. Testing Admin Access to Allowed Features:");
  const adminFeatures = ["/dashboard", "/analytics", "/orders", "/products", "/customers", "/settings"];
  for (const feature of adminFeatures) {
    const res = await fetch(`${baseUrl}${feature}`, {
      headers: { Cookie: adminCookie },
      redirect: "manual",
    });
    if (res.status === 200) {
      console.log(`✅ Admin granted access to ${feature} (HTTP 200 OK).`);
    } else {
      throw new Error(`Admin failed to access ${feature}: got status ${res.status}`);
    }
  }

  // =========================================================================
  // 2. ADMIN: Can Export Data
  // =========================================================================
  console.log("\n2. Testing Admin Export Operations (Direct Server API):");
  const exportTypes = ["orders", "products", "customers", "analytics"] as const;
  for (const type of exportTypes) {
    const res = await fetch(`${baseUrl}/api/export`, {
      method: "POST",
      headers: {
        Cookie: adminCookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type }),
    });

    const contentType = res.headers.get("content-type") || "";
    const disposition = res.headers.get("content-disposition") || "";
    const bodyText = await res.text();

    if (res.status === 200 && contentType.includes("text/csv") && bodyText.length > 50) {
      console.log(`✅ Admin successfully exported '${type}' CSV (HTTP 200 OK, disposition: ${disposition}, size: ${bodyText.length} bytes).`);
    } else {
      throw new Error(`Admin export failed for ${type}: status ${res.status}, body: ${bodyText}`);
    }
  }

  // =========================================================================
  // 3. VIEWER: Can View Analytics & Operational Pages
  // =========================================================================
  console.log("\n3. Testing Viewer Access to Allowed Views:");
  const viewerAllowedViews = ["/dashboard", "/analytics", "/orders", "/products", "/customers"];
  for (const view of viewerAllowedViews) {
    const res = await fetch(`${baseUrl}${view}`, {
      headers: { Cookie: viewerCookie },
      redirect: "manual",
    });
    if (res.status === 200) {
      console.log(`✅ Viewer permitted access to ${view} (HTTP 200 OK).`);
    } else {
      throw new Error(`Viewer unexpectedly denied access to ${view}: got status ${res.status}`);
    }
  }

  // =========================================================================
  // 4. VIEWER: Cannot Export (Direct Restricted Action Attempt)
  // =========================================================================
  console.log("\n4. Testing Viewer Restricted Action: Direct Attempt to Call Export API:");
  const viewerExportAttempt = await fetch(`${baseUrl}/api/export`, {
    method: "POST",
    headers: {
      Cookie: viewerCookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ type: "orders" }),
  });

  const viewerExportJson = await viewerExportAttempt.json();
  console.log(`- HTTP Status: ${viewerExportAttempt.status}`);
  console.log(`- Server Response:`, viewerExportJson);

  if (
    viewerExportAttempt.status === 403 &&
    viewerExportJson.code === "FORBIDDEN" &&
    viewerExportJson.error.includes("VIEWER role does not have permission 'data:export'")
  ) {
    console.log("✅ RESTRICTION ENFORCED: Server strictly rejected Viewer export request with HTTP 403 Forbidden!");
  } else {
    throw new Error(`Restricted action was NOT blocked! Status: ${viewerExportAttempt.status}, body: ${JSON.stringify(viewerExportJson)}`);
  }

  // Also test GET /api/export?type=orders
  const viewerGetExportAttempt = await fetch(`${baseUrl}/api/export?type=orders`, {
    headers: { Cookie: viewerCookie },
  });
  if (viewerGetExportAttempt.status === 403) {
    console.log("✅ RESTRICTION ENFORCED: GET /api/export also returned HTTP 403 Forbidden to Viewer.");
  } else {
    throw new Error(`GET /api/export was not blocked for Viewer: ${viewerGetExportAttempt.status}`);
  }

  // =========================================================================
  // 5. VIEWER: Cannot Access Admin-Only Settings Route (Direct Navigation)
  // =========================================================================
  console.log("\n5. Testing Viewer Restricted Action: Direct Navigation to /settings:");
  const viewerSettingsAttempt = await fetch(`${baseUrl}/settings`, {
    headers: { Cookie: viewerCookie },
    redirect: "manual",
  });
  const redirectLocation = viewerSettingsAttempt.headers.get("location") || "";
  console.log(`- HTTP Status: ${viewerSettingsAttempt.status}`);
  console.log(`- Redirect Location: ${redirectLocation}`);

  if (
    (viewerSettingsAttempt.status === 307 || viewerSettingsAttempt.status === 308) &&
    redirectLocation.includes("/dashboard") &&
    redirectLocation.includes("admin_required")
  ) {
    console.log("✅ RESTRICTION ENFORCED: Viewer redirected away from /settings to /dashboard?error=admin_required!");
  } else {
    throw new Error(`Viewer was not blocked from /settings! Status ${viewerSettingsAttempt.status}, location: ${redirectLocation}`);
  }

  // =========================================================================
  // 6. VIEWER: Cannot Call Admin Settings API (Direct Mutation Attempt)
  // =========================================================================
  console.log("\n6. Testing Viewer Restricted Action: Direct Call to Admin Settings API (/api/settings):");
  const viewerSettingsApiAttempt = await fetch(`${baseUrl}/api/settings`, {
    method: "POST",
    headers: {
      Cookie: viewerCookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rbacPolicy: "Compromised" }),
  });

  const viewerSettingsApiJson = await viewerSettingsApiAttempt.json();
  console.log(`- HTTP Status: ${viewerSettingsApiAttempt.status}`);
  console.log(`- Server Response:`, viewerSettingsApiJson);

  if (
    viewerSettingsApiAttempt.status === 403 &&
    viewerSettingsApiJson.code === "FORBIDDEN" &&
    viewerSettingsApiJson.error.includes("access:settings")
  ) {
    console.log("✅ RESTRICTION ENFORCED: Server strictly blocked Viewer from calling admin settings API with HTTP 403 Forbidden!");
  } else {
    throw new Error(`Admin settings API was NOT blocked for Viewer: ${viewerSettingsApiAttempt.status}`);
  }

  // =========================================================================
  // 7. ADMIN: Can Access and Mutate Admin Settings API
  // =========================================================================
  console.log("\n7. Testing Admin Access to Admin Settings API:");
  const adminSettingsGet = await fetch(`${baseUrl}/api/settings`, {
    headers: { Cookie: adminCookie },
  });
  if (adminSettingsGet.status === 200) {
    const data = await adminSettingsGet.json();
    console.log(`✅ Admin retrieved settings payload (tier: ${data.workspace.tier}).`);
  } else {
    throw new Error(`Admin failed to get settings: ${adminSettingsGet.status}`);
  }

  const adminSettingsPost = await fetch(`${baseUrl}/api/settings`, {
    method: "POST",
    headers: {
      Cookie: adminCookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ rbacPolicy: "Enforced" }),
  });
  if (adminSettingsPost.status === 200) {
    const postData = await adminSettingsPost.json();
    console.log(`✅ Admin modified settings successfully (updatedBy: ${postData.updatedBy}).`);
  } else {
    throw new Error(`Admin failed to POST settings: ${adminSettingsPost.status}`);
  }

  // =========================================================================
  // 8. UNAUTHENTICATED: Must Be Rejected with 401 Unauthorized
  // =========================================================================
  console.log("\n8. Testing Unauthenticated Access to Export and Settings APIs:");
  const unauthExport = await fetch(`${baseUrl}/api/export`, { method: "POST" });
  if (unauthExport.status === 401) {
    console.log("✅ Unauthenticated export request rejected with HTTP 401 Unauthorized.");
  } else {
    throw new Error(`Unauthenticated export got status: ${unauthExport.status}`);
  }

  const unauthSettings = await fetch(`${baseUrl}/api/settings`, { method: "POST" });
  if (unauthSettings.status === 401) {
    console.log("✅ Unauthenticated settings request rejected with HTTP 401 Unauthorized.");
  } else {
    throw new Error(`Unauthenticated settings got status: ${unauthSettings.status}`);
  }

  console.log("\n=======================================================================");
  console.log("🎉 ALL RBAC SERVER & DIRECT RESTRICTION TESTS PASSED WITH 100% SUCCESS!");
  console.log("=======================================================================");
}

runRBACServerTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
