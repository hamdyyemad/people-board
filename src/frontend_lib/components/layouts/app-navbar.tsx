"use client";
import { usePathname } from "next/navigation";
import {
    getRootLabelForPath,
    getRootHrefForPath,
    getCurrentPageLabel,
} from "@/frontend_lib/utils/navigation";

import { NavbarActions } from "./navbar-actions";
import { SidebarTrigger } from "@/frontend_lib/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/frontend_lib/components/ui/breadcrumb";
import { Separator } from "@/frontend_lib/components/ui/separator";

const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
};

export function Navbar() {
    const pathname = usePathname();
    const rootLabel = getRootLabelForPath(pathname);
    const rootHref = getRootHrefForPath(pathname);
    const currentPage = getCurrentPageLabel(pathname) ?? "Portal";

    return (
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar p-4 z-10 text-sidebar-foreground">
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

            <NavbarActions user={user} />
        </header>
    )
}