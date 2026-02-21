import { AppSidebar, Navbar, SecondaryNav } from ".";
import { Banner } from "../shared";
import { SidebarInset, SidebarProvider } from "@/frontend_lib/components/ui/sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  user?: { name: string; email: string; avatar: string };
}

export function DashboardShell({
  children,
}: DashboardShellProps) {

  return (
    <SidebarProvider defaultOpen={false} style={{ "--sidebar-width": "230px" } as React.CSSProperties}>
      <AppSidebar />

      <SidebarInset>
        <Navbar />

        <div className="flex min-h-0 flex-1 flex-col p-4">
          <SecondaryNav />
          <div className="min-h-0 flex-1">
            <main className="-m-4 flex flex-1 flex-col">
              <Banner />
              {children}
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
