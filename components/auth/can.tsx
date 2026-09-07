"use client";

import * as React from "react";
import { Permission, Role } from "@/types/auth";
import { useAuthorization } from "@/lib/auth/use-authorization";

export interface CanProps {
  permission?: Permission;
  role?: Role;
  not?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Declarative component for conditional rendering based on RBAC permissions and roles.
 * 
 * Example:
 * <Can permission="data:export" fallback={<p>Admin only</p>}>
 *   <ExportButton />
 * </Can>
 */
export function Can({
  permission,
  role,
  not = false,
  fallback = null,
  children,
}: CanProps) {
  const auth = useAuthorization();

  let isAllowed = true;

  if (permission) {
    isAllowed = auth.can(permission);
  }

  if (role) {
    isAllowed = isAllowed && auth.hasRole(role);
  }

  if (not) {
    isAllowed = !isAllowed;
  }

  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
