import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  Settings,
  Moon,
  FilterX,
  Search,
  Download,
} from "lucide-react";
import type { CommandItem, CommandGroup } from "@/types/commands";
import type { Permission } from "@/types/auth";

export const COMMAND_REGISTRY: readonly CommandItem[] = [
  // =========================================================================
  // Navigation Group
  // =========================================================================
  {
    id: "nav-dashboard",
    title: "Dashboard",
    description: "Executive KPIs, revenue trends, and operational overview",
    group: "Navigation",
    keywords: ["home", "main", "overview", "kpi", "summary", "revenue"],
    icon: LayoutDashboard,
    shortcut: ["G", "D"],
    requiredPermission: "view:dashboard",
    perform: ({ navigate }) => navigate("/dashboard"),
  },
  {
    id: "nav-analytics",
    title: "Analytics",
    description: "Deep-dive analysis across unit economics, regions, and segments",
    group: "Navigation",
    keywords: ["metrics", "charts", "trends", "profit", "margin", "deep dive"],
    icon: TrendingUp,
    shortcut: ["G", "A"],
    requiredPermission: "view:analytics",
    perform: ({ navigate }) => navigate("/analytics"),
  },
  {
    id: "nav-orders",
    title: "Orders",
    description: "Transaction ledger, fulfillment status, and order details",
    group: "Navigation",
    keywords: ["sales", "transactions", "ledger", "shipping", "deliveries"],
    icon: ShoppingBag,
    shortcut: ["G", "O"],
    requiredPermission: "view:orders",
    perform: ({ navigate }) => navigate("/orders"),
  },
  {
    id: "nav-products",
    title: "Products",
    description: "Merchandise catalog, SKU stock levels, and cost margins",
    group: "Navigation",
    keywords: ["catalog", "items", "inventory", "stock", "skus", "pricing"],
    icon: Package,
    shortcut: ["G", "P"],
    requiredPermission: "view:products",
    perform: ({ navigate }) => navigate("/products"),
  },
  {
    id: "nav-customers",
    title: "Customers",
    description: "Buyer directory, VIP tiers, and customer lifetime value",
    group: "Navigation",
    keywords: ["users", "buyers", "clients", "profiles", "vip", "segments"],
    icon: Users,
    shortcut: ["G", "C"],
    requiredPermission: "view:customers",
    perform: ({ navigate }) => navigate("/customers"),
  },
  {
    id: "nav-settings",
    title: "Settings",
    description: "Manage organization, RBAC security, Supabase keys, and alerts",
    group: "Navigation",
    keywords: ["admin", "preferences", "config", "supabase", "security", "team"],
    icon: Settings,
    shortcut: ["G", "S"],
    requiredPermission: "access:settings", // ADMIN ONLY
    perform: ({ navigate }) => navigate("/settings"),
  },

  // =========================================================================
  // Actions Group
  // =========================================================================
  {
    id: "act-toggle-theme",
    title: "Toggle Dark Mode",
    description: "Switch between dark and light appearance modes",
    group: "Actions",
    keywords: ["theme", "light", "dark", "mode", "color", "appearance"],
    icon: Moon,
    shortcut: ["T"],
    perform: ({ theme, setTheme }) => {
      const next = theme === "dark" ? "light" : "dark";
      setTheme(next);
    },
  },
  {
    id: "act-clear-filters",
    title: "Clear Filters",
    description: "Reset all active date, category, status, and region filters",
    group: "Actions",
    keywords: ["reset", "filters", "clear", "remove", "default"],
    icon: FilterX,
    shortcut: ["C"],
    perform: ({ clearFilters }) => {
      if (clearFilters) {
        clearFilters();
      } else if (typeof window !== "undefined") {
        // Dispatch custom global filter clear event if on dashboard
        window.dispatchEvent(new CustomEvent("cc:clear-filters"));
      }
    },
  },
  {
    id: "act-focus-search",
    title: "Focus Search",
    description: "Focus on-page table or catalog search input",
    group: "Actions",
    keywords: ["find", "search", "lookup", "filter", "input"],
    icon: Search,
    shortcut: ["/"],
    perform: ({ focusSearch }) => {
      if (focusSearch) {
        focusSearch();
      } else if (typeof document !== "undefined") {
        const input = document.querySelector<HTMLInputElement>(
          'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]'
        );
        if (input) {
          input.focus();
          input.select();
        }
      }
    },
  },
  {
    id: "act-export-data",
    title: "Export Current Filtered Data",
    description: "Download CSV telemetry for current active view",
    group: "Actions",
    keywords: ["csv", "download", "export", "report", "spreadsheet", "excel"],
    icon: Download,
    shortcut: ["E"],
    requiredPermission: "data:export", // ADMIN ONLY
    perform: async ({ triggerExport, pathname }) => {
      if (triggerExport) {
        await triggerExport();
        return;
      }

      // Determine export type based on current route
      let type = "orders";
      if (pathname.includes("/products")) type = "products";
      else if (pathname.includes("/customers")) type = "customers";
      else if (pathname.includes("/analytics")) type = "analytics";

      if (typeof window !== "undefined") {
        try {
          const res = await fetch("/api/export", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type }),
          });

          if (!res.ok) {
            let errMsg = "Export failed";
            try {
              const err = await res.json();
              errMsg = err.error || errMsg;
            } catch {
              errMsg = `Export failed (HTTP ${res.status})`;
            }
            console.error("Command palette export failed:", errMsg);
            return;
          }

          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `command-center-${type}-${new Date().toISOString().substring(0, 10)}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (e: unknown) {
          console.error("Command palette export error:", e);
        }
      }
    },
  },
] as const;

/**
 * Filter all registered commands based on user's authorized permissions.
 */
export function getAvailableCommands(can: (permission: Permission) => boolean): CommandItem[] {
  return COMMAND_REGISTRY.filter((cmd) => {
    if (!cmd.requiredPermission) return true;
    return can(cmd.requiredPermission);
  });
}

/**
 * Group commands by their CommandGroup category.
 */
export function groupCommands(commands: CommandItem[]): Record<CommandGroup, CommandItem[]> {
  const groups: Record<CommandGroup, CommandItem[]> = {
    Navigation: [],
    Actions: [],
  };

  commands.forEach((cmd) => {
    if (groups[cmd.group]) {
      groups[cmd.group].push(cmd);
    }
  });

  return groups;
}
