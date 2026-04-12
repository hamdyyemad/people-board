"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { PaginationInfo } from "./pagination-info";
import { PaginationControls } from "./pagination-controls";
import { ServerPaginationControls } from "./server-pagination-controls";
import type { ServerPaginationProps } from "../types";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  serverPagination?: ServerPaginationProps;
  currentLimit?: number;
}

function DataTablePaginationComponent<TData>({
  table,
  serverPagination,
  currentLimit = 20,
}: DataTablePaginationProps<TData>) {
  const currentCount = serverPagination
    ? serverPagination.meta.count
    : table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
      <PaginationInfo table={table} serverTotalCount={serverPagination ? currentCount : undefined} />
      {serverPagination ? (
        <ServerPaginationControls
          serverPagination={serverPagination}
          currentCount={currentCount}
          currentLimit={currentLimit}
        />
      ) : (
        <PaginationControls table={table} />
      )}
    </div>
  );
}

// Default shallow-equality memo. The row-count comparator that was here
// previously caused Prev/Next controls to stay stale when two consecutive
// pages returned the same number of rows (comparator returned true → skipped
// re-render → serverPagination.meta.prevCursor never surfaced in the UI).
export const DataTablePagination = React.memo(DataTablePaginationComponent) as typeof DataTablePaginationComponent;