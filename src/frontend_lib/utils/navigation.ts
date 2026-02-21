import { NavSection, NavItem } from "@/frontend_lib/types/navigation";

import { NAV_SECTIONS } from "@/frontend_lib/data/navigation";

/** Find the section that owns this path (by basePath prefix) */
export function getSectionByPath(pathname: string): NavSection | undefined {
  const normalized = pathname.replace(/\/$/, "") || "/";
  return NAV_SECTIONS.find(
    (s) => normalized === s.basePath || normalized.startsWith(s.basePath + "/")
  );
}

/** Active sidebar parent path for pathname (longest match: pathname === path or pathname.startsWith(path + "/")) */
export function getActiveSidebarParentPath(
  pathname: string
): string | undefined {
  const section = getSectionByPath(pathname);
  if (!section) return undefined;
  const normalized = pathname.replace(/\/$/, "") || "/";
  const matches = section.sidebar.filter(
    (item) => normalized === item.path || normalized.startsWith(item.path + "/")
  );
  if (matches.length === 0) return undefined;
  return matches.sort((a, b) => b.path.length - a.path.length)[0]?.path;
}

/** Current page label for breadcrumb (sidebar item or sub-page title) */
export function getCurrentPageLabel(pathname: string): string | undefined {
  const section = getSectionByPath(pathname);
  if (!section) return undefined;
  const parentPath = getActiveSidebarParentPath(pathname);
  const rawSub = parentPath
    ? section.secondaryTabsByParent[parentPath] ?? []
    : [];
  const subItems = rawSub.map((item) => ({
    ...item,
    path: resolveSecondaryPath(parentPath!, item.path),
  }));
  const allItems = [...section.sidebar, ...subItems];
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const exact = allItems.find((i) => i.path === normalizedPath);
  if (exact) return exact.title;
  const byPrefix = allItems
    .filter(
      (i) =>
        normalizedPath === i.path || normalizedPath.startsWith(i.path + "/")
    )
    .sort((a, b) => b.path.length - a.path.length)[0];
  return byPrefix?.title;
}

/** Sidebar items for the current path (section's top-level nav only; does not change with sub-routes) */
export function getSidebarItemsForPath(pathname: string): NavItem[] {
  const section = getSectionByPath(pathname);
  return section?.sidebar ?? [];
}

/** Resolve a secondary tab path (relative to parent) to a full path. */
function resolveSecondaryPath(parentPath: string, relativePath: string): string {
  const base = parentPath.replace(/\/$/, "") || "/";
  if (relativePath === "" || relativePath === ".") return base;
  return `${base}/${relativePath.replace(/^\//, "")}`.replace(/\/+/g, "/");
}

/** SecondaryNav tabs = sub-pages of the active sidebar item. Only when we're under a sidebar item that has sub-pages. Resolves relative paths to full paths. */
export function getSecondaryTabsForPath(pathname: string): NavItem[] {
  const section = getSectionByPath(pathname);
  if (!section) return [];
  const parentPath = getActiveSidebarParentPath(pathname);
  if (!parentPath) return [];
  const raw = section.secondaryTabsByParent[parentPath] ?? [];
  return raw.map((tab) => ({
    ...tab,
    path: resolveSecondaryPath(parentPath, tab.path),
  }));
}

/** Root href for breadcrumb (base path of current section) */
export function getRootHrefForPath(pathname: string): string {
  const section = getSectionByPath(pathname);
  return section?.basePath ?? "/";
}

/** Root label for breadcrumb */
export function getRootLabelForPath(pathname: string): string {
  const section = getSectionByPath(pathname);
  return section?.rootLabel ?? "Portal";
}
