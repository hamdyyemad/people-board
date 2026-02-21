"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/frontend_lib/components/ui/avatar";
import { Button } from "@/frontend_lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend_lib/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/frontend_lib/components/ui/sidebar";
import { useLocaleStore } from "@/frontend_lib/stores/locale-store";

export function UserDropdown({
  user,
  variant = "sidebar",
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  variant?: "sidebar" | "header";
}) {
  const { isMobile } = useSidebar();
  const isRTL = useLocaleStore((s) => s.isRTL);

  const dropdownSide =
    isMobile ? "bottom" : isRTL ? "left" : "right";

  const headerTrigger = (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 rounded-full p-0 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
      onClick={(e) => e.stopPropagation()}
    >
      <Avatar className="h-8 w-8 rounded-full">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="rounded-full text-xs">CN</AvatarFallback>
      </Avatar>
    </Button>
  );

  const trigger =
    variant === "header" ? (
      headerTrigger
    ) : (
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
      >
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg">CN</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{user.name}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    );

  const menu = (
    <DropdownMenu modal={variant === "header" ? false : true}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        className={
          variant === "header"
            ? "z-[100] min-w-56 rounded-lg"
            : "w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        }
        side={variant === "header" ? "bottom" : dropdownSide}
        align="end"
        sideOffset={variant === "header" ? 8 : 4}
        alignOffset={variant === "header" ? 0 : undefined}
        onCloseAutoFocus={(e) => variant === "header" && e.preventDefault()}
      >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  );

  if (variant === "header") {
    return menu;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>{menu}</SidebarMenuItem>
    </SidebarMenu>
  );
}
