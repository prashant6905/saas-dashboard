import type { LucideIcon } from "lucide-react";
import type { Permission } from "@/types/auth";

export type CommandGroup = "Navigation" | "Actions";

export interface CommandContext {
  navigate: (href: string) => void;
  theme?: string;
  setTheme: (theme: string) => void;
  clearFilters?: () => void;
  focusSearch?: () => void;
  triggerExport?: (type?: string) => Promise<void> | void;
  pathname: string;
}

export interface CommandItem {
  id: string;
  title: string;
  description?: string;
  group: CommandGroup;
  keywords: string[];
  icon: LucideIcon;
  shortcut?: string[];
  requiredPermission?: Permission;
  perform: (context: CommandContext) => void | Promise<void>;
}
