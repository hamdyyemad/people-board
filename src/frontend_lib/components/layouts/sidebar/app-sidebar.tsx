"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/frontend_lib/utils/utils";
import { getSidebarItemsForPath } from "@/frontend_lib/utils/navigation";

import { usePathname } from "next/navigation";

import { Logo } from "@/frontend_lib/components/shared/branding/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/frontend_lib/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      className="!border-r-0 group-data-[side=left]:!border-r-0"
      {...props}
    >
      <Header />
      <Content />
    </Sidebar>
  );
}

function Header() {
  return (
    <SidebarHeader className="bg-sidebar text-sidebar-foreground py-4 border-0">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Link href="/" className="flex items-center gap-3">
              <Logo showText={false} size="sm" />
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">PeopleBoard</span>
                <span className="text-[10px] opacity-70">HR Platform</span>
              </div>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

function Content() {
  const pathname = usePathname();
  const items = getSidebarItemsForPath(pathname);

  if (items.length === 0) {
    return (
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        <SidebarGroup>
          <SidebarGroupContent />
        </SidebarGroup>
      </SidebarContent>
    );
  }

  return (
    <SidebarContent className="bg-sidebar text-sidebar-foreground">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1">
            {items.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path + "/"));
              const Icon = item.icon;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.title}
                    className={cn(
                      "transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""
                    )}
                  >
                    <Link href={item.path} className="flex items-center gap-3">
                      {Icon && <Icon className="size-4" />}
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}
