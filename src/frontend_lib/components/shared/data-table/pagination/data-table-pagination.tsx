"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { PaginationInfo } from "./pagination-info";
import { PaginationControls } from "./pagination-controls";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

function DataTablePaginationComponent<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
      <PaginationInfo table={table} />
      <PaginationControls table={table} />
    </div>
  );
}

// Memoize with custom comparison that checks pagination state
export const DataTablePagination = React.memo(
  DataTablePaginationComponent,
  (prevProps, nextProps) => {
    const prevState = prevProps.table.getState().pagination;
    const nextState = nextProps.table.getState().pagination;
    const prevRowCount = prevProps.table.getFilteredRowModel().rows.length;
    const nextRowCount = nextProps.table.getFilteredRowModel().rows.length;
    
    // Only re-render if pagination state or row count changes
    return (
      prevState.pageIndex === nextState.pageIndex &&
      prevState.pageSize === nextState.pageSize &&
      prevRowCount === nextRowCount
    );
  }
) as typeof DataTablePaginationComponent;