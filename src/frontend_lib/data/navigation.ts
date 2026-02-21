import { LayoutDashboard, Inbox, FileText, Send, ArchiveX, Trash2 } from "lucide-react";

import { NavSection } from "@/frontend_lib/types/navigation";

/**
 * Single source of truth for all app routing.
 * - Sidebar = top-level sections only (Overview, Dashboard, Profile for employee).
 * - SecondaryNav = sub-pages of the active sidebar item (e.g. Profile's sub-pages when on Profile).
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    role: "employee",
    basePath: "/portal",
    rootLabel: "Employee Portal",
    sidebar: [{ title: "Overview", path: "/portal/overview", icon: LayoutDashboard }],
    secondaryTabsByParent: {
      "/portal/overview": [
        { title: "Overview", path: "" },
        { title: "Dashboard", path: "dashboard" },
        { title: "Activities", path: "activities" },
        { title: "Leave", path: "leave" },
        { title: "Attendance", path: "attendance" },
        { title: "Timesheets", path: "timesheets" },
        { title: "Approvals", path: "approvals" },
        { title: "Career History", path: "career" },
        { title: "Files", path: "files" },
      ],
    },
  },
  {
    role: "hr",
    basePath: "/workspace",
    rootLabel: "HR Management",
    sidebar: [
      { title: "Board", path: "/workspace/board", icon: Inbox },
      { title: "Drafts", path: "/workspace/drafts", icon: FileText },
      { title: "Sent", path: "/workspace/sent", icon: Send },
      { title: "Junk", path: "/workspace/junk", icon: ArchiveX },
      { title: "Trash", path: "/workspace/trash", icon: Trash2 },
    ],
    secondaryTabsByParent: {
      "/workspace/board": [],
      "/workspace/drafts": [],
      "/workspace/sent": [],
      "/workspace/junk": [],
      "/workspace/trash": [],
    },
  },
];
