"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { Role, Permission } from "@/types/auth";
import { hasPermission, hasRole } from "@/lib/auth/permissions";

export interface UseAuthorizationResult {
  role: Role;
  can: (permission: Permission) => boolean;
  isAdmin: boolean;
  isViewer: boolean;
  hasRole: (requiredRole: Role) => boolean;
}

export function useAuthorization(): UseAuthorizationResult {
  const { user } = useAuth();
  const role: Role = user?.role || "VIEWER";

  const checkPermission = React.useCallback(
    (permission: Permission) => hasPermission(role, permission),
    [role]
  );

  const checkRole = React.useCallback(
    (requiredRole: Role) => hasRole(role, requiredRole),
    [role]
  );

  return {
    role,
    can: checkPermission,
    isAdmin: role === "ADMIN",
    isViewer: role === "VIEWER",
    hasRole: checkRole,
  };
}
