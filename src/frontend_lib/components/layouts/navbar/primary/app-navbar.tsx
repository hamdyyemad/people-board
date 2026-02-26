"use client";
import { SidebarTrigger } from "@/frontend_lib/components/ui/sidebar";
import { Separator } from "@/frontend_lib/components/ui/separator";
import { NavbarBreadcrumbs } from "./navbar-breadcrumbs";
import { NavbarActions } from "./navbar-actions";
import { NavbarUserMenu } from "./navbar-user-menu";

export function AppNavbar() {
    return (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground">
            {/* --- Left Section --- */}
            <NavbarLeftSection />

            {/* --- Right Section --- */}
            <NavbarRightSection />
        </header>
    );
}

function NavbarLeftSection() {
    return (
        <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <NavbarBreadcrumbs />
        </div>
    );
}

function NavbarRightSection() {
    return (
        <div className="flex items-center gap-4">
            <NavbarActions />
            <NavbarUserMenu />
        </div>
    );
}