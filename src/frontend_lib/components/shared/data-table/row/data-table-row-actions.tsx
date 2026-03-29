"use client";

import * as React from "react";
import { Row, Table } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/frontend_lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/frontend_lib/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
  actions: (row: TData, table: Table<TData>) => React.ReactNode;
}

function DataTableRowActionsComponent<TData>({
  row,
  table,
  actions,
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
        {actions(row.original, table)}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Memoize the component to prevent re-renders when only dropdown state changes
export const DataTableRowActions = React.memo(
  DataTableRowActionsComponent,
  (prevProps, nextProps) => {
    // Only re-render if the row data actually changes
    return prevProps.row.original === nextProps.row.original;
  }
) as typeof DataTableRowActionsComponent;
