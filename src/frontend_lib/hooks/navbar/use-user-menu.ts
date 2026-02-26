"use client";

import type { LucideIcon } from "lucide-react";
import { LogOut, Settings } from "lucide-react";
import { useMemo } from "react";

export interface UserMenuItem {
  id: string;
  icon: LucideIcon;
  label: string;
  destructive?: boolean;
  onClick?: () => void;
  href?: string;
}

export function useUserMenu(): { menuItems: UserMenuItem[] } {
  return useMemo(
    () => ({
      menuItems: [
        {
          id: "settings",
          icon: Settings,
          label: "Settings",
          onClick: () => {},
        },
        {
          id: "sign-out",
          icon: LogOut,
          label: "Sign out",
          destructive: true,
          onClick: () => {},
        },
      ],
    }),
    []
  );
}
