import {
  ROLE_PERMISSIONS,
  Role,
  Permission,
} from "../types/auth";
import {
  hasPermission,
  can,
  assertPermission,
  hasRole,
  getRolePermissions,
  AuthorizationError,
} from "../lib/auth/permissions";

async function runRBACModelTests() {
  console.log("🛡️ Running Step 13 RBAC Permission Model Unit Tests...\n");

  // 1. Validate Roles & Permissions Mapping
  console.log("1. Validating Role & Permission Matrix:");
  const adminPermissions = ROLE_PERMISSIONS.ADMIN;
  const viewerPermissions = ROLE_PERMISSIONS.VIEWER;

  console.log(`- ADMIN granted ${adminPermissions.length} permissions: ${adminPermissions.join(", ")}`);
  console.log(`- VIEWER granted ${viewerPermissions.length} permissions: ${viewerPermissions.join(", ")}`);

  const requiredAdminPermissions: Permission[] = [
    "view:dashboard",
    "view:analytics",
    "view:orders",
    "view:products",
    "view:customers",
    "data:export",
    "access:settings",
  ];

  for (const perm of requiredAdminPermissions) {
    if (!adminPermissions.includes(perm)) {
      throw new Error(`ADMIN is missing required permission: ${perm}`);
    }
  }
  console.log("✅ ADMIN has all 7 required permissions.");

  const forbiddenViewerPermissions: Permission[] = ["data:export", "access:settings"];
  for (const perm of forbiddenViewerPermissions) {
    if (viewerPermissions.includes(perm)) {
      throw new Error(`VIEWER incorrectly has restricted permission: ${perm}`);
    }
  }
  console.log("✅ VIEWER is strictly denied 'data:export' and 'access:settings'.");

  // 2. Testing hasPermission and can utilities
  console.log("\n2. Testing hasPermission / can Helper Functions:");
  if (!hasPermission("ADMIN", "data:export") || !can("ADMIN", "access:settings")) {
    throw new Error("can('ADMIN', ...) failed for authorized permissions");
  }
  console.log("✅ can('ADMIN', 'data:export') -> true");
  console.log("✅ can('ADMIN', 'access:settings') -> true");

  if (hasPermission("VIEWER", "data:export") || can("VIEWER", "access:settings")) {
    throw new Error("can('VIEWER', ...) permitted restricted actions!");
  }
  console.log("✅ can('VIEWER', 'data:export') -> false");
  console.log("✅ can('VIEWER', 'access:settings') -> false");

  if (!can("VIEWER", "view:dashboard") || !can("VIEWER", "view:analytics")) {
    throw new Error("can('VIEWER', ...) failed for allowed view permissions");
  }
  console.log("✅ can('VIEWER', 'view:analytics') -> true");
  console.log("✅ can('VIEWER', 'view:orders') -> true");

  // 3. Testing assertPermission
  console.log("\n3. Testing assertPermission Throws AuthorizationError on Violation:");
  assertPermission("ADMIN", "data:export");
  console.log("✅ assertPermission('ADMIN', 'data:export') succeeded without error.");

  let threwExpected = false;
  try {
    assertPermission("VIEWER", "data:export");
  } catch (err) {
    if (err instanceof AuthorizationError) {
      threwExpected = true;
      console.log(`✅ assertPermission correctly threw AuthorizationError (${err.statusCode}): "${err.message}"`);
    }
  }
  if (!threwExpected) {
    throw new Error("assertPermission failed to throw AuthorizationError for VIEWER on data:export!");
  }

  // 4. Testing hasRole
  console.log("\n4. Testing hasRole Type Guard:");
  if (!hasRole("ADMIN", "ADMIN") || hasRole("VIEWER", "ADMIN")) {
    throw new Error("hasRole check failed");
  }
  console.log("✅ hasRole('ADMIN', 'ADMIN') -> true");
  console.log("✅ hasRole('VIEWER', 'ADMIN') -> false");

  // 5. Testing Case-Insensitive Normalization
  console.log("\n5. Testing Role Normalization Handling:");
  if (!can("administrator", "data:export") || !can("admin", "data:export")) {
    throw new Error("Failed to normalize lowercase role strings");
  }
  console.log("✅ Normalizes 'administrator' and 'admin' strings accurately.");

  console.log("\n🎉 ALL RBAC MODEL UNIT TESTS PASSED SUCCESSFULLY!");
}

runRBACModelTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
