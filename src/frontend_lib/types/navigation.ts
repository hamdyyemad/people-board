import type { LucideIcon } from "lucide-react";

export type Role = "employee" | "hr";

export interface NavItem {
  /** Display label */
  title: string;
  /** Full path (e.g. /portal/overview) */
  path: string;
  icon?: LucideIcon;
}

export interface NavSection {
  role: Role;
  /** Base path for this section (e.g. /portal, /hr) */
  basePath: string;
  /** Label for the root breadcrumb and area name */
  rootLabel: string;
  /** Sidebar: top-level nav only. Does not change when moving between sub-pages. */
  sidebar: NavItem[];
  /**
   * Sub-pages for SecondaryNav, keyed by the parent sidebar path.
   * When the user is under a sidebar item (e.g. /portal/profile), SecondaryNav shows these tabs.
   * Sidebar stays fixed; only SecondaryNav reflects the current section's sub-pages.
   * Tab paths are relative to the parent key: "" or "." = parent path, "dashboard" = parent/dashboard.
   */
  secondaryTabsByParent: Record<string, NavItem[]>;
}
