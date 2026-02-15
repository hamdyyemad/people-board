import { AppSidebar } from "./app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/frontend_lib/components/ui/breadcrumb";
import { Separator } from "@/frontend_lib/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/frontend_lib/components/ui/sidebar";

interface DashboardShellProps {
    children: React.ReactNode;
    rootLabel: string;      // e.g., "Employee Portal" or "HR Management"
    rootHref?: string;
    currentPage: string;    // e.g., "Dashboard" or "Inbox"
    role: "EMPLOYEE" | "HR"; // To control what the sidebar shows
}

export function DashboardShell({
    children,
    rootLabel,
    rootHref = "#",
    currentPage,
    role
}: DashboardShellProps) {
    return (
        <SidebarProvider style={{ "--sidebar-width": "350px" } as React.CSSProperties}>
            {/* Pass the role to the sidebar so it knows which menu to render */}
            <AppSidebar role={role} />

            <SidebarInset>
                <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4 z-10">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href={rootHref}>{rootLabel}</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{currentPage}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="p-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}