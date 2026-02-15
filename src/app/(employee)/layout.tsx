import { DashboardShell } from "@/frontend_lib/components/layouts/dashboard-shell";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      role="EMPLOYEE"
      rootLabel="Employee Portal"
      currentPage="Dashboard"
    >
      {children}
    </DashboardShell>
  );
}