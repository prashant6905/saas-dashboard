import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Settings,
} from "lucide-react";
import type { NavItem, NavSection } from "@/types/nav";

export const APP_NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiredPermission: "view:dashboard",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: TrendingUp,
    badge: "Live",
    requiredPermission: "view:analytics",
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingBag,
    requiredPermission: "view:orders",
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
    requiredPermission: "view:products",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
    requiredPermission: "view:customers",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    requiredPermission: "access:settings",
  },
];

export const APP_NAV_SECTIONS: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        requiredPermission: "view:dashboard",
      },
    ],
  },
  {
    title: "ANALYTICS",
    items: [
      {
        title: "Analytics",
        href: "/analytics",
        icon: TrendingUp,
        badge: "Live",
        requiredPermission: "view:analytics",
      },
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingBag,
        requiredPermission: "view:orders",
      },
      {
        title: "Products",
        href: "/products",
        icon: Package,
        requiredPermission: "view:products",
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
        requiredPermission: "view:customers",
      },
    ],
  },
  {
    title: "MANAGEMENT",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        requiredPermission: "access:settings",
      },
    ],
  },
];

