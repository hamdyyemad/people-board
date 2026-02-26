"use client";

import type { LucideIcon } from "lucide-react";
import { Bell } from "lucide-react";
import { useMemo } from "react";

export interface NavbarActionItem {
  id: string;
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
}

export function useNavbarActions(): { actionItems: NavbarActionItem[] } {
  return useMemo(
    () => ({
      actionItems: [
        {
          id: "notifications",
          icon: Bell,
          label: "Notifications",
          onClick: () => {},
        },
      ],
    }),
    []
  );
}
