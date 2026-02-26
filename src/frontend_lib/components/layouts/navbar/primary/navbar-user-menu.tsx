"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/frontend_lib/components/ui/avatar";
import { Button } from "@/frontend_lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend_lib/components/ui/dropdown-menu";
import { LanguageSwitcherPill } from "@/frontend_lib/components/shared/language/language-switcher-tabs";
import { ThemeSwitcherPill } from "@/frontend_lib/components/shared/theme/theme-switcher-tabs";
import { useUserMenu } from "@/frontend_lib/hooks/navbar/use-user-menu";

import { AVATAR_IMAGE } from "@/frontend_lib/data/demo-avatar";
const user = {
  name: "Christine Spalding",
  avatar: AVATAR_IMAGE,
};


export function NavbarUserMenu() {
  const { menuItems } = useUserMenu();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-full pl-1 pr-2 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8 shrink-0 rounded-full border border-border/70">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="rounded-full text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[100] min-w-56 rounded-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="px-2 py-2 text-left">
            <p className="truncate text-sm font-semibold">{user.name}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-2 py-1.5">
          <ThemeSwitcherPill />
        </div>

        <div className="px-2 py-1.5">
          <LanguageSwitcherPill />
        </div>

        <DropdownMenuSeparator />

        {menuItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <>
              <Icon className="h-4 w-4" />
              {item.label}
            </>
          );
          const className = item.destructive
            ? "text-destructive focus:text-destructive"
            : undefined;
          if (item.href) {
            return (
              <DropdownMenuItem key={item.id} asChild>
                <Link href={item.href} className={className}>
                  {content}
                </Link>
              </DropdownMenuItem>
            );
          }
          return (
            <DropdownMenuItem
              key={item.id}
              className={className}
              onClick={item.onClick}
            >
              {content}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
