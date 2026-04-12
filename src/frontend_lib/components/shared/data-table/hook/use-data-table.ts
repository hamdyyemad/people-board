import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface UseDataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  enableRowSelection?: boolean;
  defaultPageSize?: number;
  /**
   * Set to `true` when the parent controls pagination server-side.
   * TanStack Table will display all received rows as-is instead of slicing them.
   */
  manualPagination?: boolean;
}

/**
 * Core hook for table state management
 * Contains only shared table logic: sorting, filtering, pagination, selection
 */
export function useDataTable<TData>({
  data,
  columns,
  enableRowSelection = true,
  defaultPageSize = 20,
  manualPagination = false,
}: UseDataTableProps<TData>) {
  // Core Table State
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  // Table Instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    // When server pagination is active, tell TanStack not to slice the data.
    // pageCount: -1 means "unknown" — our cursor controls decide next/prev.
    manualPagination,
    ...(manualPagination ? { pageCount: -1 } : {}),
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: defaultPageSize },
    },
  });

  // Memoize setGlobalFilter to prevent callback recreation
  const stableSetGlobalFilter = React.useCallback((value: string) => {
    setGlobalFilter(value);
  }, []);

  return {
    table,
    globalFilter,
    setGlobalFilter: stableSetGlobalFilter,
  };
}
