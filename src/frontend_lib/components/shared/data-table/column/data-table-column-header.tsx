"use client";

import * as React from "react";
import { Column } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  EyeOff,
  Filter,
  FilterX,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/frontend_lib/components/ui/dropdown-menu";
import { cn } from "@/frontend_lib/utils/utils";
import { DataTableColumnFilterModal } from "./data-table-column-filter-modal";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const [filterOpen, setFilterOpen] = React.useState(false);

  const isSorted = column.getIsSorted();
  const isFiltered = column.getIsFiltered();

  if (!column.getCanSort() && !column.getCanFilter()) {
    return <div className={cn("text-xs font-medium", className)}>{title}</div>;
  }

  return (
    <>
      <div className={cn("flex items-center gap-1 group", className)}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "-ml-2",
                (isSorted || isFiltered) && "text-primary"
              )}
            >
              <span>{title}</span>

              {/* Sort indicator */}
              {isSorted === "desc" ? (
                <ArrowDown className="h-3.5 w-3.5 shrink-0" />
              ) : isSorted === "asc" ? (
                <ArrowUp className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover:opacity-70" />
              )}

              {/* Filter active dot */}
              {isFiltered && (
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-44">
            {/* Sort */}
            <DropdownMenuItem
              onClick={() => column.toggleSorting(false)}
              className={cn(isSorted === "asc" && "text-primary font-medium")}
            >
              <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              Sort Ascending
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => column.toggleSorting(true)}
              className={cn(isSorted === "desc" && "text-primary font-medium")}
            >
              <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              Sort Descending
            </DropdownMenuItem>

            {isSorted && (
              <DropdownMenuItem onClick={() => column.clearSorting()}>
                <ArrowUpDown className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Clear Sort
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Filter */}
            {column.getCanFilter() && (
              <>
                <DropdownMenuItem onClick={() => setFilterOpen(true)}>
                  <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  Filter…
                  {isFiltered && (
                    <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
                {isFiltered && (
                  <DropdownMenuItem
                    onClick={() => column.setFilterValue(undefined)}
                    className="text-muted-foreground"
                  >
                    <FilterX className="mr-2 h-3.5 w-3.5" />
                    Clear Filter
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
              </>
            )}

            {/* Hide */}
            <DropdownMenuItem
              onClick={() => column.toggleVisibility(false)}
              className="text-muted-foreground"
            >
              <EyeOff className="mr-2 h-3.5 w-3.5" />
              Hide Column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter modal */}
      <DataTableColumnFilterModal
        column={column}
        title={title}
        open={filterOpen}
        onOpenChange={setFilterOpen}
      />
    </>
  );
}
