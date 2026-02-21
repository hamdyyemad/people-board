"use client";

import { Bell } from "lucide-react";
import { ThemeToggle } from "@/frontend_lib/components/shared/theme/theme-toggle";
import { LanguageToggle } from "@/frontend_lib/components/shared/language/language-toggle";
import { Button } from "@/frontend_lib/components/ui/button";
import { UserDropdown } from "./user-dropdown";

interface NavbarActionsProps {
  user: { name: string; email: string; avatar: string };
}

export function NavbarActions({ user }: NavbarActionsProps) {
  return (
    <div className="ms-auto flex items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-full"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
      </Button>
      <ThemeToggle className="shrink-0" size="sm" />
      <LanguageToggle className="shrink-0" size="sm" showText={false} />
      <UserDropdown user={user} variant="header" />
    </div>
  );
}
