import { DashboardShell } from "@/frontend_lib/components/layouts/dashboard-shell";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      role="HR"
      rootLabel="HR Management"
      currentPage="Inbox"
    >
      {children}
    </DashboardShell>
  );
}