"use client";
import { usePathname } from "next/navigation";
import {
    getRootLabelForPath,
    getRootHrefForPath,
    getCurrentPageLabel,
} from "@/frontend_lib/utils/navigation";
import { 
    Breadcrumb, 
    BreadcrumbItem, 
    BreadcrumbLink, 
    BreadcrumbList, 
    BreadcrumbPage, 
    BreadcrumbSeparator 
} from "@/frontend_lib/components/ui/breadcrumb";

/**
 * Internal Component: Logic moved here so AppNavbar stays clean.
 * Handles path-based breadcrumb generation.
 */
export function NavbarBreadcrumbs() {
    const pathname = usePathname();
    const rootLabel = getRootLabelForPath(pathname);
    const rootHref = getRootHrefForPath(pathname);
    const currentPage = getCurrentPageLabel(pathname) ?? "Portal";

    return (
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
    );
}