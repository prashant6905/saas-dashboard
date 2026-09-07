export type Role = "ADMIN" | "VIEWER";

export type Permission =
  | "view:dashboard"
  | "view:analytics"
  | "view:orders"
  | "view:products"
  | "view:customers"
  | "data:export"
  | "access:settings";

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  ADMIN: [
    "view:dashboard",
    "view:analytics",
    "view:orders",
    "view:products",
    "view:customers",
    "data:export",
    "access:settings",
  ],
  VIEWER: [
    "view:dashboard",
    "view:analytics",
    "view:orders",
    "view:products",
    "view:customers",
  ],
} as const;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthSession {
  accessToken: string;
  expiresAt: number;
}
