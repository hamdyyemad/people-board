import { type UserRole } from "@/frontend_lib/hooks/auth";

interface RoleOptionData {
  id: UserRole;
  label: string;
  description: string;
  icon: string;
  glowColor: string;
  iconColor: string;
}

// Function to get translated role options
export function getRoleOptions(t: (key: string) => string): RoleOptionData[] {
  return [
    {
      id: "HR",
      label: t("hrStaff"),
      description: t("hrDescription"),
      icon: "M20 7H4C3.44772 7 3 7.44772 3 8V16C3 16.5523 3.44772 17 4 17H20C20.5523 17 21 16.5523 21 16V8C21 7.44772 20.5523 7 20 7Z",
      glowColor: "16, 80, 94",
      iconColor: "text-primary",
    },
    {
      id: "Employee",
      label: t("employee"),
      description: t("employeeDescription"),
      icon: "M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z",
      glowColor: "34, 197, 94",
      iconColor: "text-green-600",
    },
  ];
}

// Fallback for non-translated usage (backwards compatibility)
export const roleOptions: RoleOptionData[] = [
  {
    id: "HR",
    label: "HR Staff",
    description: "Login as HR",
    icon: "M20 7H4C3.44772 7 3 7.44772 3 8V16C3 16.5523 3.44772 17 4 17H20C20.5523 17 21 16.5523 21 16V8C21 7.44772 20.5523 7 20 7Z",
    glowColor: "16, 80, 94",
    iconColor: "text-primary",
  },
  {
    id: "Employee",
    label: "Employee",
    description: "Login as Employee",
    icon: "M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z",
    glowColor: "34, 197, 94",
    iconColor: "text-green-600",
  },
];
