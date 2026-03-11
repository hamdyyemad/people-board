"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/frontend_lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend_lib/components/ui/dropdown-menu";

interface ToolbarColumnsProps<TData> {
  table: Table<TData>;
}

function ToolbarColumnsComponent<TData>({ table }: ToolbarColumnsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden lg:inline">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter((col) => col.getCanHide())
          .map((col) => (
            <DropdownMenuCheckboxItem
              key={col.id}
              className="capitalize"
              checked={col.getIsVisible()}
              onCheckedChange={(value) => col.toggleVisibility(!!value)}
            >
              {col.id.replace(/_/g, " ")}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Memoize with custom comparison that checks actual column visibility state
export const ToolbarColumns = React.memo(
  ToolbarColumnsComponent,
  (prevProps, nextProps) => {
    // Get column visibility state from both props
    const prevColumns = prevProps.table.getAllColumns().filter(col => col.getCanHide());
    const nextColumns = nextProps.table.getAllColumns().filter(col => col.getCanHide());
    
    // Compare column count
    if (prevColumns.length !== nextColumns.length) return false;
    
    // Compare each column's visibility state
    for (let i = 0; i < prevColumns.length; i++) {
      if (
        prevColumns[i].id !== nextColumns[i].id ||
        prevColumns[i].getIsVisible() !== nextColumns[i].getIsVisible()
      ) {
        return false;
      }
    }
    
    // No changes detected, skip re-render
    return true;
  }
) as typeof ToolbarColumnsComponent;