"use client";

import * as React from "react";
import { DataTableSkeleton } from "./loaders";
import { DataTableToolbar } from "./toolbar";
import { DataTableDisplayFactory } from "./displays";
import { DataTablePagination } from "./pagination";

import { useDataTable, useDataTableColumns } from "./hook";

import { DataTableConfig } from "./types";

/**
 * DataTable Component - Main Orchestrator
 *
 * A flexible, feature-rich data table with multiple view modes (table, list, grid),
 * filtering, sorting, pagination, and export/import capabilities.
 *
 * Architecture:
 * - Core table logic managed by useDataTable hook (shared state)
 * - View mode managed directly in DataTableDisplayFactory
 * - Child components use their own hooks for component-specific logic
 * - Import functionality is self-contained in ToolbarImport component
 */
function DataTableComponent<TData>({
  columns: userColumns,
  data,
  filterFields,
  defaultPageSize = 20,
  enableRowSelection = true,
  enableColumnVisibility = true,
  enableExport = true,
  enableImport = false,
  enableViewToggle = true,
  exportFileName = "export",
  importTemplateColumns,
  isLoading = false,
  isFetching = false,
  error = null,
  gridCard,
  listCard,
  rowActions,
  onRowClick,
  onImport,
  serverPagination,
}: DataTableConfig<TData>) {
  // Build columns with selection and actions
  const columns = useDataTableColumns({
    userColumns,
    enableRowSelection,
    rowActions,
  });

  // Core table instance with shared state (sorting, filtering, pagination, selection)
  const { table, globalFilter, setGlobalFilter } = useDataTable({
    data,
    columns,
    enableRowSelection,
    defaultPageSize,
    manualPagination: !!serverPagination,
  });

  // Memoize callbacks to prevent unnecessary re-renders
  const handleGlobalFilterChange = React.useCallback(
    (value: string) => {
      setGlobalFilter(value);
    },
    [setGlobalFilter]
  );

  // Show skeleton while loading
  if (isLoading) {
    return (
      <DataTableSkeleton
        columns={userColumns}
        rowCount={8}
        enableRowSelection={enableRowSelection}
        enableRowActions={!!rowActions}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 bg-red-200 text-red-700 rounded">
        <h2 className="text-lg font-semibold">Error loading data</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar row: search/actions on right, space on left for positioned toggles */}
      <div className="flex items-center justify-end gap-4">
        <DataTableToolbar
          table={table}
          globalFilter={globalFilter}
          onGlobalFilterChange={handleGlobalFilterChange}
          enableColumnVisibility={enableColumnVisibility}
          enableExport={enableExport}
          enableImport={enableImport}
          enableViewToggle={enableViewToggle}
          filterFields={filterFields}
          exportFileName={exportFileName}
          importTemplateColumns={importTemplateColumns}
          onImport={onImport}
        />
      </div>

      {/* Display — relative wrapper lets us overlay a spinner during page transitions */}
      <div className="relative">
        <DataTableDisplayFactory
          table={table}
          columnCount={columns.length}
          onRowClick={onRowClick}
          listCard={listCard}
          gridCard={gridCard}
          hasListView={!!listCard}
          hasGridView={!!gridCard}
          enableViewToggle={enableViewToggle}
        />
        {/* Page-transition overlay: shows only when re-fetching, not on first load */}
        {isFetching && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-background/60 backdrop-blur-[1px]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
      

      <DataTablePagination
        table={table}
        serverPagination={serverPagination}
        currentLimit={defaultPageSize}
      />
    </div>
  );
}

// Memoize the DataTable using React's default shallow-equality check.
// A custom comparator was previously used here but caused stale renders
// in edge cases (e.g. same row count across pages blocking pagination
// control updates). Default shallow comparison is safe because all props
// that should be stable (columns, callbacks, filterFields) are defined
// as module-level constants or wrapped in useCallback/useMemo by callers.
export const DataTable = React.memo(DataTableComponent) as typeof DataTableComponent;