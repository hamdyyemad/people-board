"use client";

import Link from "next/link";
import { Button } from "@/frontend_lib/components/ui/button";
import { useNavbarActions } from "@/frontend_lib/hooks/navbar/use-navbar-actions";

export function NavbarActions() {
  const { actionItems } = useNavbarActions();

  return (
    <div className="ms-auto flex items-center gap-1 sm:gap-2">
      {actionItems.map((item) => {
        const Icon = item.icon;
        const content = <Icon className="h-4 w-4" />;
        const buttonProps = {
          variant: "ghost" as const,
          size: "icon" as const,
          className: "h-9 w-9 shrink-0 rounded-full",
          "aria-label": item.label,
        };
        if (item.href) {
          return (
            <Button key={item.id} asChild {...buttonProps}>
              <Link href={item.href}>{content}</Link>
            </Button>
          );
        }
        return (
          <Button
            key={item.id}
            {...buttonProps}
            onClick={item.onClick}
          >
            {content}
          </Button>
        );
      })}
    </div>
  );
}
