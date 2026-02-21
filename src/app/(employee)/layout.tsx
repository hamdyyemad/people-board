import { DashboardShell } from "@/frontend_lib/components/layouts";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}