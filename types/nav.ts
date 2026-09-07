import type { LucideIcon } from "lucide-react";
import type { Permission, Role } from "@/types/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  external?: boolean;
  requiredPermission?: Permission;
  requiredRole?: Role;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
