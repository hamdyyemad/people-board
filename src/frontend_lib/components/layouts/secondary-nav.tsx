"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/frontend_lib/utils/utils";
import { getSecondaryTabsForPath } from "@/frontend_lib/utils/navigation";

export function SecondaryNav() {
  const pathname = usePathname();
  const normalized = pathname.replace(/\/$/, "") || "/";
  const tabs = getSecondaryTabsForPath(pathname);

  if (tabs.length === 0) return null;

  return (
    <nav
      className="flex shrink-0 gap-1 border-b border-border bg-background p-4 pt-0"
      aria-label="Section navigation"
    >
      {tabs.map(({ title, path }) => {
        const isActive = normalized === path;
        return (
          <Link
            key={path}
            href={path}
            className={cn(
              "inline-flex items-center border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            )}
          >
            {title}
          </Link>
        );
      })}
    </nav>
  );
}
