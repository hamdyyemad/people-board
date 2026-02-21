import { DashboardShell } from "@/frontend_lib/components/layouts";

export default function HRLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}