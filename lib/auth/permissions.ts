import {
  Role,
  Permission,
  ROLE_PERMISSIONS,
} from "@/types/auth";

export class AuthorizationError extends Error {
  public readonly statusCode: number = 403;
  public readonly code: string = "FORBIDDEN";
  public readonly permission?: Permission;

  constructor(message = "Forbidden: You do not have permission to perform this action.", permission?: Permission) {
    super(message);
    this.name = "AuthorizationError";
    this.permission = permission;
  }
}

/**
 * Check if a specific role possesses a permission.
 */
export function hasPermission(
  role: Role | string | undefined | null,
  permission: Permission
): boolean {
  if (!role) return false;
  const normalizedRole = (role.toUpperCase() === "ADMINISTRATOR" ? "ADMIN" : role.toUpperCase()) as Role;
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  if (!permissions) return false;
  return permissions.includes(permission);
}

/**
 * Convenient alias for hasPermission.
 */
export const can = hasPermission;

/**
 * Assert that a role possesses a permission, otherwise throw an AuthorizationError.
 */
export function assertPermission(
  role: Role | string | undefined | null,
  permission: Permission
): void {
  if (!hasPermission(role, permission)) {
    const roleLabel = role || "Unauthenticated";
    throw new AuthorizationError(
      `Forbidden: Role '${roleLabel}' does not have permission '${permission}'.`,
      permission
    );
  }
}

/**
 * Check if a user role matches a required role.
 */
export function hasRole(
  userRole: Role | string | undefined | null,
  requiredRole: Role
): boolean {
  if (!userRole) return false;
  const normalized = (userRole.toUpperCase() === "ADMINISTRATOR" ? "ADMIN" : userRole.toUpperCase()) as Role;
  return normalized === requiredRole;
}

/**
 * Retrieve all granted permissions for a given role.
 */
export function getRolePermissions(role: Role | string): readonly Permission[] {
  const normalized = (role.toUpperCase() === "ADMINISTRATOR" ? "ADMIN" : role.toUpperCase()) as Role;
  return ROLE_PERMISSIONS[normalized] || [];
}

/**
 * Admin-only application routes that require the ADMIN role.
 */
export const ADMIN_ROUTES = ["/settings"];

/**
 * All protected application routes requiring authenticated access.
 */
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/analytics",
  "/orders",
  "/products",
  "/customers",
  "/settings",
];
